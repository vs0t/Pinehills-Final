var PlayerSearchBoxEA = React.createClass({
  getInitialState: function () {
    return {
      dataEA: [],
      data: [],
      viewthepage: 0,
      rewardsDataEA: [],
      selectedRewardIdEA: "",
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

  loadPlayersFromServer: function (searchQueryEA) {
    $.ajax({
      url: "/searchplayers",
      data: searchQueryEA,
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ dataEA: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/searchplayers", status, err.toString());
      }.bind(this),
    });
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

  componentDidMount: function () {
    this.loadAllowLogin();
    this.loadRewardsData();
  },

  render: function () {
    if (
      this.state.viewthepage == 0 ||
      (this.state.viewthepage !== 2 && this.state.viewthepage !== 6)
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
          <PlayerSearchFormEA
            onPlayerSearch={this.loadPlayersFromServer}
            rewardsDataEA={this.state.rewardsDataEA}
          />
          <br />
          {this.state.dataEA.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Zip</th>
                  <th>Reward Level</th>
                </tr>
              </thead>
              <PlayerListEA data={this.state.dataEA} />
            </table>
          )}
        </div>
      );
    }
  },
});

var PlayerSearchFormEA = React.createClass({
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
    var nextState = {};
    nextState[event.target.name] = event.target.value;
    this.setState(nextState);
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
          data={this.props.rewardsDataEA}
          onChange={this.handleRewardChange}
        />
        <input type="submit" value="Search Players" />
      </form>
    );
  },
});

var PlayerListEA = React.createClass({
  render: function () {
    var playerNodesEA = this.props.data.map(function (player) {
      return (
        <Player
          key={player.PlayerID}
          playerFirstName={player.PlayerFirstName}
          playerLastName={player.PlayerLastName}
          playerEmail={player.PlayerEmail}
          playerAddress={player.PlayerAddress}
          playerCity={player.PlayerCity}
          playerState={player.PlayerState}
          playerZip={player.PlayerZip}
          rewardLevel={player.RewardLevel}
        />
      );
    });
    return <tbody>{playerNodesEA}</tbody>;
  },
});

var Player = React.createClass({
  render: function () {
    return (
      <tr>
        <td>{this.props.playerFirstName}</td>
        <td>{this.props.playerLastName}</td>
        <td>{this.props.playerEmail}</td>
        <td>{this.props.playerAddress}</td>
        <td>{this.props.playerCity}</td>
        <td>{this.props.playerState}</td>
        <td>{this.props.playerZip}</td>
        <td>{this.props.rewardLevel}</td>
      </tr>
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
    return (
      <select name="rewardsId" id="rewardsId" onChange={this.handleChange}>
        <option value="">No Reward Level</option>
        {this.props.data.map(function (rewardEA) {
          return (
            <option key={rewardEA.RewardsID} value={rewardEA.RewardsID}>
              {rewardEA.RewardsName}
            </option>
          );
        })}
      </select>
    );
  },
});

ReactDOM.render(<PlayerSearchBoxEA />, document.getElementById("content"));
