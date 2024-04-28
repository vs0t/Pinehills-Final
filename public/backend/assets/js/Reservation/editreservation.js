var ReservationEditBox = React.createClass({
  getInitialState: function () {
    return {
      reservationsEA: [],
      selectedReservationIdEA: null,
      selectedReservationDetailsEA: null,
      dataEA: [],
      viewthepageEA: 0,
      userDataEA: [],
    };
  },
  loadAllowLogin: function () {
    $.ajax({
      url: "/getloggedin",
      dataType: "json",
      cache: false,
      success: function (datalog) {
        this.setState({ dataEA: datalog });
        this.setState({ viewthepageEA: this.state.dataEA[0].CatagoryID });
        console.log("Logged in:" + this.state.viewthepageEA);
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },
  componentDidMount: function () {
    this.fetchReservations();
    this.loadAllowLogin();
    this.loadUserOptions();
  },
  fetchReservations: function (searchQueryEA) {
    $.ajax({
      url: "/searchreservations",
      data: searchQueryEA,
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ reservationsEA: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("Error fetching reservations:", err.toString());
      }.bind(this),
    });
  },
  loadUserOptions: function () {
    $.ajax({
      url: "/getplayers",
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ userDataEA: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/getplayers", status, err.toString());
      }.bind(this),
    });
  },
  selectReservation: function (reservationId, reservationDetails) {
    this.setState({
      selectedReservationIdEA: reservationId,
      selectedReservationDetailsEA: reservationDetails,
    });
  },
  deleteReservation: function (reservationId) {
    fetch(`/deletereservation/${reservationId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("Reservation deleted successfully!");
        this.fetchReservations();
      })
      .catch((error) => console.error("Error deleting reservation:", error));
  },
  render: function () {
    if (
      this.state.viewthepageEA == 0 ||
      (this.state.viewthepageEA !== 2 && this.state.viewthepageEA !== 1)
    ) {
      return (
        <div id="error">
          You do not have access to this page, contact the Systems Admin if you
          need access but don't have it.
        </div>
      );
    } else {
      return (
        <div>
          <h1>Reservation Edit</h1>
          <ReservationSearchForm
            onReservationSearch={this.fetchReservations}
            userData={this.state.userDataEA}
          />
          <ReservationList
            reservations={this.state.reservationsEA}
            onSelectReservation={this.selectReservation}
            onDeleteReservation={this.deleteReservation}
          />
          {this.state.selectedReservationIdEA && (
            <ReservationEditForm
              reservationId={this.state.selectedReservationIdEA}
              reservationDetails={this.state.selectedReservationDetailsEA}
              refreshReservations={this.fetchReservations}
            />
          )}
        </div>
      );
    }
  },
});

var ReservationList = React.createClass({
  render: function () {
    var reservationNodesEA = this.props.reservations.map((reservation) => (
      <Reservation
        key={reservation.ReservationsID}
        reservation={reservation}
        onSelectReservation={this.props.onSelectReservation}
        onDeleteReservation={this.props.onDeleteReservation}
      />
    ));
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th>Reservation ID</th>
              <th>Reservation Date</th>
              <th>Reservation Time</th>
              <th>Player Count</th>
              <th>Player Name</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>{reservationNodesEA}</tbody>
        </table>
      </div>
    );
  },
});

var Reservation = React.createClass({
  handleEditClick: function () {
    this.props.onSelectReservation(
      this.props.reservation.ReservationsID,
      this.props.reservation
    );
  },
  handleDeleteClick: function () {
    this.props.onDeleteReservation(this.props.reservation.ReservationsID);
  },
  render: function () {
    const {
      ReservationsID,
      ReservationsDate,
      ReservationsTime,
      ReservationsCount,
      PlayerFirstName,
      PlayerLastName,
      PlayerID,
    } = this.props.reservation;
    const reservationDate = new Date(ReservationsDate);
    const formattedDate = reservationDate.toISOString().split("T")[0];
    return (
      <tr>
        <td>{ReservationsID}</td>
        <td>{formattedDate}</td>
        <td>{ReservationsTime}</td>
        <td>{ReservationsCount}</td>
        <td>
          {PlayerFirstName} {PlayerLastName}
        </td>
        <td>
          <button onClick={this.handleEditClick}>Edit</button>
        </td>
        <td>
          <button onClick={this.handleDeleteClick}>Delete</button>
        </td>
      </tr>
    );
  },
});

var ReservationEditForm = React.createClass({
  getInitialState: function () {
    const { ReservationsDate, ReservationsTime, ReservationsCount, PlayerID } =
      this.props.reservationDetails;
    const reservationDate = new Date(ReservationsDate);
    const formattedDate = reservationDate.toISOString().split("T")[0];
    return {
      reservationDateEA: formattedDate || "",
      reservationTimeEA: ReservationsTime || "",
      reservationCountEA: ReservationsCount || "",
      selectedPlayerIdEA: PlayerID || "",
      userDataEA: [],
    };
  },
  componentDidMount: function () {
    this.loadUserOptions();
  },
  componentDidUpdate: function (prevProps) {
    if (this.props.reservationId !== prevProps.reservationId) {
      const {
        ReservationsDate,
        ReservationsTime,
        ReservationsCount,
        PlayerID,
      } = this.props.reservationDetails;
      const reservationDate = new Date(ReservationsDate);
      const formattedDate = reservationDate.toISOString().split("T")[0];
      this.setState({
        reservationDateEA: formattedDate || "",
        reservationTimeEA: ReservationsTime || "",
        reservationCountEA: ReservationsCount || "",
        selectedPlayerIdEA: PlayerID || "",
      });
    }
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
  handleSubmit: function (event) {
    event.preventDefault();
    const reservationDataEA = {
      reservationId: this.props.reservationId,
      reservationDate: this.state.reservationDateEA,
      reservationTime: this.state.reservationTimeEA,
      reservationCount: this.state.reservationCountEA,
      playerId: this.state.selectedPlayerIdEA,
    };

    fetch("/updatereservation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reservationDataEA),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("Reservation updated successfully!");
        this.props.refreshReservations();
      })
      .catch((error) => console.error("Error updating reservation:", error));
  },
  handleChange: function (event) {
    var stateUpdateEA = {};
    stateUpdateEA[event.target.name] = event.target.value;
    this.setState(stateUpdateEA);
  },
  handlePlayerChange: function (event) {
    this.setState({ selectedPlayerIdEA: event.target.value });
  },
  handleTimeChange: function (time) {
    this.setState({ reservationTimeEA: time });
  },
  render: function () {
    return (
      <div>
        <h2>Edit Reservation ID: {this.props.reservationId}</h2>
        <form onSubmit={this.handleSubmit}>
          <label>
            Select Player:
            <SelectList
              data={this.state.userDataEA}
              value={this.state.selectedPlayerIdEA}
              onChange={this.handlePlayerChange}
            />
          </label>
          <br />
          <label>
            Reservation Date:
            <input
              type="date"
              name="reservationDateEA"
              value={this.state.reservationDateEA}
              onChange={this.handleChange}
            />
          </label>
          <br />
          <label>
            Reservation Time:
            <TimeSelectList
              value={this.state.reservationTimeEA}
              onChange={this.handleTimeChange}
            />
          </label>
          <br />
          <label>
            Reservation Count:
            <input
              type="number"
              name="reservationCountEA"
              value={this.state.reservationCountEA}
              onChange={this.handleChange}
            />
          </label>
          <br />
          <button type="submit">Submit Reservation Update</button>
        </form>
      </div>
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
    var optionsEA = this.props.data.map(function (itemEA) {
      return (
        <option key={itemEA.PlayerID} value={itemEA.PlayerID}>
          {itemEA.PlayerFirstName + " " + itemEA.PlayerLastName}
        </option>
      );
    });
    return (
      <select value={this.props.value} onChange={this.handleChange}>
        <option value="">Select Player</option>
        {optionsEA}
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

    var optionsEA = timesEA.map(function (timeObjEA, index) {
      return (
        <option key={index} value={timeObjEA.value}>
          {timeObjEA.display}
        </option>
      );
    });

    return (
      <select value={this.props.value} onChange={this.handleChange}>
        <option value="">Select Time</option>
        {optionsEA}
      </select>
    );
  },
});

var ReservationSearchForm = React.createClass({
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
    // Format the selected time as 'HH:mm:ss'
    const selectedTime = e.target.value;
    const formattedTime = selectedTime.slice(0, 5) + ':00';
    this.setState({ selectedTimeEA: formattedTime });
  },
  handleGuestsChange: function (e) {
    this.setState({ numberOfGuestsEA: e.target.value });
  },
  handleSubmit: function (e) {
    e.preventDefault();
    var searchQueryEA = {
      playerId: this.state.selectedUserIdEA,
      reservationsDate: this.state.selectedDateEA,
      reservationsTime: this.state.selectedTimeEA,
      reservationsCount: this.state.numberOfGuestsEA,
    };
    this.props.onReservationSearch(searchQueryEA);
  },
  render: function () {
    return (
      <form className="reservationSearchForm" onSubmit={this.handleSubmit}>
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
        <input type="submit" value="Search Reservations" />
      </form>
    );
  },
});

ReactDOM.render(<ReservationEditBox />, document.getElementById("content"));
