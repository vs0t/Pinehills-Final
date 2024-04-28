var LoginBox = React.createClass({
  getInitialState: function () {
    return { data: [], loggedInPlayerId: null };
  },

  handleLogin: function (logininfo) {
    $.ajax({
      url: '/loginplayer/',
      dataType: 'json',
      type: 'POST',
      data: logininfo,
      success: function (data) {
        this.setState({ data: data });
        if (data.playerId) {
          this.setState({ loggedInPlayerId: data.playerId });
        }
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  render: function () {
    if (this.state.loggedInPlayerId) {
      return (
        <div>
          <ReservationBox playerId={this.state.loggedInPlayerId} />
        </div>
      );
    } else {
      return (
        <div>
          <h1>Player Login</h1>
          <LoginForm onLoginSubmit={this.handleLogin} />
          <br />
        </div>
      );
    }
  }
});

var LoginForm = React.createClass({
  getInitialState: function () {
    return {
      playeremail: "",
      playerpw: "",
    };
  },

  handleOptionChange: function (e) {
    this.setState({ selectedOption: e.target.value });
  },

  handleSubmit: function (e) {
    e.preventDefault();
    var playerpw = this.state.playerpw.trim();
    var playeremail = this.state.playeremail.trim();
    this.props.onLoginSubmit({ playerpw: playerpw, playeremail: playeremail });
  },

  handleChange: function (event) {
    this.setState({ [event.target.id]: event.target.value });
  },

  render: function () {
    return (
      <div>
        <div id="theform">
          <form onSubmit={this.handleSubmit}>
            <table>
              <tbody>
                <tr>
                  <th>Player Email</th>
                  <td>
                    <input name="playeremail" id="playeremail" value={this.state.playeremail} onChange={this.handleChange} />
                  </td>
                </tr>
                <tr>
                  <th>Player Password</th>
                  <td>
                    <input type="password" name="playerpw" id="playerpw" value={this.state.playerpw} onChange={this.handleChange} />
                  </td>
                </tr>
              </tbody>
            </table><br />
            <input type="submit" value="Enter Login" />
          </form>
        </div>
        <div>
          <br />
          <form onSubmit={this.getInitialState}>
            <input type="submit" value="Clear Form" />
          </form>
        </div>
      </div>
    );
  }
});

var ReservationBox = React.createClass({
  getInitialState: function () {
    return {
      userDataEA: [],
    };
  },

  loadUserOptions: function () {
    $.ajax({
      url: "/getplayers",
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
  },

  handleReservationSubmit: function (reservationEA) {
    reservationEA.playerId = this.props.playerId;

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
    return (
      <div className="reservationBox">
        <h2>Schedule a Reservation</h2>
        <ReservationForm
          onReservationSubmit={this.handleReservationSubmit}
          userData={this.state.userDataEA}
        />
      </div>
    );
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
    startTime.setHours(8, 0, 0);

    while (startTime.getHours() < 16) {
      var hour = startTime.getHours();
      var minute = startTime.getMinutes();
      var timeValueEA =
        hour.toString().padStart(2, "0") +
        ":" +
        minute.toString().padStart(2, "0") +
        ":00";

      var timeDisplayEA = startTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      timesEA.push({ value: timeValueEA, display: timeDisplayEA });

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

ReactDOM.render(<LoginBox />, document.getElementById("content"));