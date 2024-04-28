var ReservationBox = React.createClass({
  getInitialState: function () {
    return {
      userDataEA: [],
      data: [],
      viewthepage: 0,
    };
  },
  loadAllowLogin: function () {
    $.ajax({
      url: "/getloggedin",
      dataType: "json",
      cache: false,
      success: function (datalog) {
        this.setState({ data: datalog });
        this.setState({ viewthepage: this.state.data[0].CatagoryID });
        console.log("Logged in:" + this.state.viewthepage);
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },
  loadUserOptions: function () {
    // Fetch the user options
    $.ajax({
      url: "/getplayers", // Endpoint to fetch users
      dataType: "json",
      cache: false,
      success: function (dataEA) {
        this.setState({ userDataEA: dataEA });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/getplayers", status, err.toString());
      }.bind(this),
    });
  },
  componentDidMount: function () {
    this.loadUserOptions();
    this.loadAllowLogin();
  },
  handleReservationSubmit: function (reservationEA) {
    $.ajax({
      url: "/insertreservation",
      dataType: "json",
      type: "POST",
      data: reservationEA,
      success: function (dataEA) {
        console.log("Reservation inserted successfully");
        alert(dataEA.message);
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/insertreservation", status, err.toString());
      }.bind(this),
    });
  },
  render: function () {
    if (this.state.viewthepage == 0 || this.state.viewthepage !== 2 && this.state.viewthepage !== 1) {
      return (
        <div id="error">
          You do not have access to this page, contact the Systems Admin if you
          need access but don't have it.
        </div>
      );
    } else {
      return (
        <div className="reservationBox">
          <h2>Schedule a Reservation</h2>
          <ReservationForm
            onReservationSubmit={this.handleReservationSubmit}
            userData={this.state.userDataEA}
          />
        </div>
      );
    }
  },
});

var ReservationForm = React.createClass({
  getInitialState: function () {
    return {
      selectedUserIdEA: "",
      selectedDateEA: "",
      selectedTimeEA: "",
      numberOfGuestsEA: "",
    };
  },
  handleUserChange: function (e) {
    this.setState({ selectedUserIdEA: e.target.value });
  },
  handleDateChange: function (e) {
    this.setState({ selectedDateEA: e.target.value });
  },
  handleTimeChange: function (e) {
    this.setState({ selectedTimeEA: e.target.value });
  },
  handleGuestsChange: function (e) {
    this.setState({ numberOfGuestsEA: e.target.value });
  },
  handleSubmit: function (e) {
    e.preventDefault();
    var reservationEA = {
      playerId: this.state.selectedUserIdEA,
      reservationsDate: this.state.selectedDateEA,
      reservationsTime: this.state.selectedTimeEA,
      reservationsCount: this.state.numberOfGuestsEA,
    };
    this.props.onReservationSubmit(reservationEA);
  },

  render: function () {
    return (
      <form className="reservationForm" onSubmit={this.handleSubmit}>
        <table>
          <tbody>
            <tr>
              <th>Select Player</th>
              <td>
                <SelectList
                  data={this.props.userData}
                  onChange={this.handleUserChange}
                />
              </td>
            </tr>
            <tr>
              <th>Select Date</th>
              <td>
                <input type="date" onChange={this.handleDateChange} />
              </td>
            </tr>
            <tr>
              <th>Select Time</th>
              <td>
                <TimeSelectList onChange={this.handleTimeChange} />
              </td>
            </tr>
            <tr>
              <th>Number of Guests</th>
              <td>
                <input
                  type="number"
                  onChange={this.handleGuestsChange}
                  min="1"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <input type="submit" value="Make Reservation" />
      </form>
    );
  },
});

var SelectList = React.createClass({
  handleChange: function (event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  },
  render: function () {
    var options = this.props.data.map(function (itemEA) {
      return (
        <option key={itemEA.PlayerID} value={itemEA.PlayerID}>
          {itemEA.PlayerFirstName + " " + itemEA.PlayerLastName}
        </option>
      );
    });
    return (
      <select onChange={this.handleChange}>
        <option value="">Select Player</option>
        {options}
      </select>
    );
  },
});

var TimeSelectList = React.createClass({
  handleChange: function (event) {
    this.props.onChange(event.target.value);
  },
  render: function () {
    var timesEA = [];
    var startTime = new Date();
    startTime.setHours(8, 0, 0); // Start at 8:00 AM

    // Generate times every 8 minutes from 8:00 AM to 4:00 PM
    while (startTime.getHours() < 16) {
      // Store the time in 24-hour format
      var hour = startTime.getHours();
      var minute = startTime.getMinutes();
      var timeValueEA =
        hour.toString().padStart(2, "0") +
        ":" +
        minute.toString().padStart(2, "0") +
        ":00";

      // Display the time in 12-hour format with AM/PM
      var timeDisplayEA = startTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      // Push the time object to the times array
      timesEA.push({ value: timeValueEA, display: timeDisplayEA });

      // Increment time by 8 minutes
      startTime.setMinutes(startTime.getMinutes() + 8);
    }

    var options = timesEA.map(function (timeObjEA, index) {
      return (
        <option key={index} value={timeObjEA.value}>
          {timeObjEA.display}
        </option>
      );
    });

    return (
      <select onChange={this.props.onChange}>
        <option value="">Select Time</option>
        {options}
      </select>
    );
  },
});

ReactDOM.render(<ReservationBox />, document.getElementById("content"));
