var PlayerEditBox = React.createClass({
  getInitialState: function () {
    return {
      playersEA: [],
      selectedPlayerIdEA: null,
      selectedPlayerDetailsEA: null,
      rewardsDataEA: [],
      dataEA: [],
      viewthepageEA: 0,
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
    this.loadAllowLogin();
    this.fetchPlayers();
    this.loadRewardsData();
  },
  loadRewardsData: function () {
    $.ajax({
      url: "/getrewards",
      dataType: "json",
      cache: false,
      success: function (dataEA) {
        this.setState({ rewardsDataEA: dataEA });
      }.bind(this),
    });
  },
  fetchPlayers: function (searchQueryEA) {
    $.ajax({
      url: "/searchplayers",
      data: searchQueryEA,
      dataType: "json",
      cache: false,
      success: function (dataEA) {
        this.setState({ playersEA: dataEA });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("Error fetching players:", err.toString());
      }.bind(this),
    });
  },
  selectPlayer: function (playerId, playerDetails) {
    this.setState({
      selectedPlayerIdEA: playerId,
      selectedPlayerDetailsEA: playerDetails,
    });
  },
  deletePlayer: function (playerId) {
    fetch(`/deleteplayer/${playerId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("Player deleted successfully!");
        this.fetchPlayers();
      })
      .catch((error) => console.error("Error deleting player:", error));
  },
  render: function () {
    if (this.state.viewthepageEA == 0 || this.state.viewthepageEA !== 2) {
      return (
        <div id="error">
          You do not have access to this page, contact the Systems Admin if you
          need access but don't have it.
        </div>
      );
    } else {
      return (
        <div>
          <h1>Player Edit</h1>
          <PlayerSearchForm
            onPlayerSearch={this.fetchPlayers}
            rewardsData={this.state.rewardsDataEA}
          />
          <PlayerList
            players={this.state.playersEA}
            onSelectPlayer={this.selectPlayer}
            onDeletePlayer={this.deletePlayer}
          />
          {this.state.selectedPlayerIdEA && (
            <PlayerEditForm
              playerId={this.state.selectedPlayerIdEA}
              playerDetails={this.state.selectedPlayerDetailsEA}
              rewardsData={this.state.rewardsDataEA}
            />
          )}
        </div>
      );
    }
  },
});

var PlayerList = React.createClass({
  render: function () {
    var playerNodesEA = this.props.players.map((player) => (
      <Player
        key={player.PlayerID}
        player={player}
        onSelectPlayer={this.props.onSelectPlayer}
        onDeletePlayer={this.props.onDeletePlayer}
      />
    ));
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th>Player ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>{playerNodesEA}</tbody>
        </table>
      </div>
    );
  },
});

var Player = React.createClass({
  handleEditClick: function () {
    this.props.onSelectPlayer(this.props.player.PlayerID, this.props.player);
  },
  handleDeleteClick: function () {
    this.props.onDeletePlayer(this.props.player.PlayerID);
  },
  render: function () {
    const { PlayerID, PlayerFirstName, PlayerLastName, PlayerEmail } =
      this.props.player;
    return (
      <tr>
        <td>{PlayerID}</td>
        <td>{PlayerFirstName}</td>
        <td>{PlayerLastName}</td>
        <td>{PlayerEmail}</td>
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

var PlayerEditForm = React.createClass({
  getInitialState: function () {
    const {
      PlayerFirstName,
      PlayerLastName,
      PlayerEmail,
      PlayerAddress,
      PlayerCity,
      PlayerState,
      PlayerZip,
      RewardsID,
    } = this.props.playerDetails;
    return {
      firstNameEA: PlayerFirstName || "",
      lastNameEA: PlayerLastName || "",
      emailEA: PlayerEmail || "",
      addressEA: PlayerAddress || "",
      cityEA: PlayerCity || "",
      stateEA: PlayerState || "",
      zipEA: PlayerZip || "",
      rewardsIdEA: RewardsID || "",
    };
  },
  componentDidUpdate: function (prevProps) {
    if (this.props.playerId !== prevProps.playerId) {
      const {
        PlayerFirstName,
        PlayerLastName,
        PlayerEmail,
        PlayerAddress,
        PlayerCity,
        PlayerState,
        PlayerZip,
        RewardsID,
      } = this.props.playerDetails;

      this.setState({
        firstNameEA: PlayerFirstName || "",
        lastNameEA: PlayerLastName || "",
        emailEA: PlayerEmail || "",
        addressEA: PlayerAddress || "",
        cityEA: PlayerCity || "",
        stateEA: PlayerState || "",
        zipEA: PlayerZip || "",
        rewardsIdEA: RewardsID || "",
      });
    }
  },
  handleSubmit: function (event) {
    event.preventDefault();
    const playerDataEA = {
      playerId: this.props.playerId,
      firstName: this.state.firstNameEA,
      lastName: this.state.lastNameEA,
      email: this.state.emailEA,
      address: this.state.addressEA,
      city: this.state.cityEA,
      state: this.state.stateEA,
      zip: this.state.zipEA,
      rewardsId: this.state.rewardsIdEA,
    };

    fetch("/updateplayer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(playerDataEA),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("Player updated successfully! Refresh Page to View Changes.");
        this.props.refreshPlayers();
      })
      .catch((error) => console.error("Error updating player:", error));
  },
  handleChange: function (event) {
    var stateUpdateEA = {};
    stateUpdateEA[event.target.name] = event.target.value;
    this.setState(stateUpdateEA);
  },
  handleRewardChange: function (selectedRewardId) {
    this.setState({ rewardsIdEA: selectedRewardId });
  },
  render: function () {
    return (
      <div>
        <h2>Edit Player ID: {this.props.playerId}</h2>
        <form onSubmit={this.handleSubmit}>
          <label>
            First Name:
            <input
              type="text"
              name="firstNameEA"
              value={this.state.firstNameEA}
              onChange={this.handleChange}
            />
          </label>
          <br />
          <label>
            Last Name:
            <input
              type="text"
              name="lastNameEA"
              value={this.state.lastNameEA}
              onChange={this.handleChange}
            />
          </label>
          <br />
          <label>
            Email:
            <input
              type="email"
              name="emailEA"
              value={this.state.emailEA}
              onChange={this.handleChange}
            />
          </label>
          <br />
          <label>
            Address:
            <input
              type="text"
              name="addressEA"
              value={this.state.addressEA}
              onChange={this.handleChange}
            />
          </label>
          <br />
          <label>
            City:
            <input
              type="text"
              name="cityEA"
              value={this.state.cityEA}
              onChange={this.handleChange}
            />
          </label>
          <br />
          <label>
            State:
            <input
              type="text"
              name="stateEA"
              value={this.state.stateEA}
              onChange={this.handleChange}
            />
          </label>
          <br />
          <label>
            Zip:
            <input
              type="text"
              name="zipEA"
              value={this.state.zipEA}
              onChange={this.handleChange}
            />
          </label>
          <br />
          <label>
            Rewards:
            <SelectList
              data={this.props.rewardsData}
              onRewardChange={this.handleRewardChange}
              value={this.state.rewardsIdEA}
            />
          </label>
          <br />
          <button type="submit">Submit Player Update</button>
        </form>
      </div>
    );
  },
});

var SelectList = React.createClass({
  handleChange: function (event) {
    if (this.props.onRewardChange) {
      this.props.onRewardChange(event.target.value);
    }
  },
  render: function () {
    return (
      <select
        name="rewardsIdEA"
        id="rewardsIdEA"
        value={this.props.value}
        onChange={this.handleChange}
      >
        <option value="">No Reward</option>
        {this.props.data.map(function (reward) {
          return (
            <option key={reward.RewardsID} value={reward.RewardsID}>
              {reward.RewardsName}
            </option>
          );
        })}
      </select>
    );
  },
});

var PlayerSearchForm = React.createClass({
  getInitialState: function () {
    return {
      playerFirstNameEA: "",
      playerLastNameEA: "",
      playerEmailEA: "",
      playerAddressEA: "",
      playerCityEA: "",
      playerStateEA: "",
      playerZipEA: "",
      selectedRewardIdEA: "",
    };
  },
  handleRewardChange: function (event) {
    this.setState({ selectedRewardIdEA: event.target.value });
  },
  handleSubmit: function (e) {
    e.preventDefault();
    var searchQueryEA = {
      firstName: this.state.playerFirstNameEA.trim(),
      lastName: this.state.playerLastNameEA.trim(),
      email: this.state.playerEmailEA.trim(),
      address: this.state.playerAddressEA.trim(),
      city: this.state.playerCityEA.trim(),
      state: this.state.playerStateEA.trim(),
      zip: this.state.playerZipEA.trim(),
      rewardsLevel: this.state.selectedRewardIdEA.trim(),
    };
    this.props.onPlayerSearch(searchQueryEA);
  },
  handleChange: function (event) {
    var nextStateEA = {};
    nextStateEA[event.target.name] = event.target.value;
    this.setState(nextStateEA);
  },
  render: function () {
    return (
      <form onSubmit={this.handleSubmit}>
        <h3>Use the form below to search for players.</h3>
        <input
          type="text"
          name="playerFirstNameEA"
          value={this.state.playerFirstNameEA}
          onChange={this.handleChange}
          placeholder="First Name"
        />
        <input
          type="text"
          name="playerLastNameEA"
          value={this.state.playerLastNameEA}
          onChange={this.handleChange}
          placeholder="Last Name"
        />
        <input
          type="text"
          name="playerEmailEA"
          value={this.state.playerEmailEA}
          onChange={this.handleChange}
          placeholder="Email"
        />
        <input
          type="text"
          name="playerAddressEA"
          value={this.state.playerAddressEA}
          onChange={this.handleChange}
          placeholder="Address"
        />
        <input
          type="text"
          name="playerCityEA"
          value={this.state.playerCityEA}
          onChange={this.handleChange}
          placeholder="City"
        />
        <input
          type="text"
          name="playerStateEA"
          value={this.state.playerStateEA}
          onChange={this.handleChange}
          placeholder="State"
        />
        <input
          type="text"
          name="playerZipEA"
          value={this.state.playerZipEA}
          onChange={this.handleChange}
          placeholder="Zip"
        />
        <SelectList
          data={this.props.rewardsData}
          onChange={this.handleRewardChange}
        />
        <input type="submit" value="Search Players" />
      </form>
    );
  },
});

ReactDOM.render(<PlayerEditBox />, document.getElementById("content"));