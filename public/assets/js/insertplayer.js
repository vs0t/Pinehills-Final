var PlayerBox = React.createClass({
  handlePlayerSubmit: function (playerEA) {
    $.ajax({
      url: "/insertplayer",
      dataType: "json",
      type: "POST",
      data: playerEA,
      success: function (dataEA) {
        this.setState({ data: dataEA });
        alert(dataEA.message);
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },
  render: function () {
    return (
      <div className="PlayerBox">
        <Playerform onPlayerSubmit={this.handlePlayerSubmit} />
      </div>
    );
  },
});

var Playerform = React.createClass({
  getInitialState: function () {
    return {
      playerFirstNameEA: "",
      playerLastNameEA: "",
      playerEmailEA: "",
      playerPasswordEA: "",
      playerAddressEA: "",
      playerCityEA: "",
      playerStateEA: "",
      playerZipEA: "",
      rewardsDataEA: [],
      selectedRewardIdEA: "",
    };
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

  handleRewardChange: function (event) {
    this.setState({ selectedRewardIdEA: event.target.value });
  },

  componentDidMount: function () {
    this.loadRewardsData();
  },

  handleSubmit: function (e) {
    e.preventDefault();

    var playerFirstNameEA = this.state.playerFirstNameEA.trim();
    var playerLastNameEA = this.state.playerLastNameEA.trim();
    var playerEmailEA = this.state.playerEmailEA.trim();
    var playerPasswordEA = this.state.playerPasswordEA.trim();
    var playerAddressEA = this.state.playerAddressEA.trim();
    var playerCityEA = this.state.playerCityEA.trim();
    var playerStateEA = this.state.playerStateEA.trim();
    var playerZipEA = this.state.playerZipEA.trim();
    var selectedRewardIdEA = this.state.selectedRewardIdEA;

    if (!this.validateEmail(playerEmailEA)) {
      console.log("Bad Email " + this.validateEmail(playerEmailEA));
      return;
    }

    if (!playerFirstNameEA || !playerLastNameEA || !playerEmailEA || !playerPasswordEA) {
      console.log("Required fields are missing");
      return;
    }

    this.props.onPlayerSubmit({
      playerFirstName: playerFirstNameEA,
      playerLastName: playerLastNameEA,
      playerEmail: playerEmailEA,
      playerPassword: playerPasswordEA,
      playerAddress: playerAddressEA,
      playerCity: playerCityEA,
      playerState: playerStateEA,
      playerZip: playerZipEA,
      rewardsId: selectedRewardIdEA,
    });
  },

  validateEmail: function (value) {
    var re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(value);
  },

  commonValidate: function () {
    return true;
  },

  setValue: function (field, event) {
    var object = {};
    object[field] = event.target.value;
    this.setState(object);
  },

  render: function () {
    return (
      <form className="playerForm" onSubmit={this.handleSubmit}>
        <h2>Player Account Creation Area</h2>
        <table>
          <tbody>
            <tr>
              <th>Player First Name</th>
              <td>
                <TextInput
                  value={this.state.playerFirstNameEA}
                  uniqueName="playerFirstNameEA"
                  textArea={false}
                  required={true}
                  minCharacters={1}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "playerFirstNameEA")}
                  errorMessage="Player First Name is invalid"
                  emptyMessage="Player First Name is required"
                />
              </td>
            </tr>
            <tr>
              <th>Player Last Name</th>
              <td>
                <TextInput
                  value={this.state.playerLastNameEA}
                  uniqueName="playerLastNameEA"
                  textArea={false}
                  required={true}
                  minCharacters={1}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "playerLastNameEA")}
                  errorMessage="Player Last Name is invalid"
                  emptyMessage="Player Last Name is required"
                />
              </td>
            </tr>
            <tr>
              <th>Player Email</th>
              <td>
                <TextInput
                  value={this.state.playerEmailEA}
                  uniqueName="playerEmailEA"
                  textArea={false}
                  minCharacters={1}
                  required={true}
                  validate={this.validateEmail}
                  onChange={this.setValue.bind(this, "playerEmailEA")}
                  errorMessage="Invalid Email Address"
                  emptyMessage="Email Address is Required"
                />
              </td>
            </tr>
            <tr>
              <th>Player Password</th>
              <td>
                <TextInput
                  inputType="password"
                  value={this.state.playerPasswordEA}
                  uniqueName="playerPasswordEA"
                  textArea={false}
                  required={true}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "playerPasswordEA")}
                  errorMessage="Invalid Password"
                  emptyMessage="Password is Required"
                />
              </td>
            </tr>
            <tr>
              <th>Player Address</th>
              <td>
                <TextInput
                  value={this.state.playerAddressEA}
                  uniqueName="playerAddressEA"
                  textArea={false}
                  required={false}
                  minCharacters={6}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "playerAddressEA")}
                  errorMessage="Player Address is invalid"
                />
              </td>
            </tr>
            <tr>
              <th>Player City</th>
              <td>
                <TextInput
                  value={this.state.playerCityEA}
                  uniqueName="playerCityEA"
                  textArea={false}
                  required={false}
                  minCharacters={6}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "playerCityEA")}
                  errorMessage="Player City is invalid"
                />
              </td>
            </tr>
            <tr>
              <th>Player State</th>
              <td>
                <TextInput
                  value={this.state.playerStateEA}
                  uniqueName="playerStateEA"
                  textArea={false}
                  minCharacters={2}
                  required={false}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "playerStateEA")}
                  errorMessage=""
                  emptyMessage=""
                />
              </td>
            </tr>
            <tr>
              <th>Player Zip</th>
              <td>
                <TextInput
                  value={this.state.playerZipEA}
                  uniqueName="playerZipEA"
                  textArea={false}
                  required={false}
                  minCharacters={5}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "playerZipEA")}
                  errorMessage=""
                  emptyMessage=""
                />
              </td>
            </tr>
            <tr>
              <th>Rewards</th>
              <td>
                <SelectList
                  data={this.state.rewardsDataEA}
                  onChange={this.handleRewardChange}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <input type="submit" value="Create Account" />
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

var InputError = React.createClass({
  getInitialState: function () {
    return {
      message: "Input is invalid",
    };
  },
  render: function () {
    var errorClass = classNames(this.props.className, {
      error_container: true,
      visible: this.props.visible,
      invisible: !this.props.visible,
    });

    return <td> {this.props.errorMessage} </td>;
  },
});

var TextInput = React.createClass({
  getInitialState: function () {
    return {
      isEmpty: true,
      value: null,
      valid: false,
      errorMessage: "",
      errorVisible: false,
    };
  },

  handleChange: function (event) {
    this.validation(event.target.value);

    if (this.props.onChange) {
      this.props.onChange(event);
    }
  },

  validation: function (value, valid) {
    if (typeof valid === "undefined") {
      valid = true;
    }

    var message = "";
    var errorVisible = false;

    if (!valid) {
      message = this.props.errorMessage;
      valid = false;
      errorVisible = true;
    } else if (this.props.required && jQuery.isEmptyObject(value)) {
      message = this.props.emptyMessage;
      valid = false;
      errorVisible = true;
    } else if (value.length < this.props.minCharacters) {
      message = this.props.errorMessage;
      valid = false;
      errorVisible = true;
    }

    this.setState({
      value: value,
      isEmpty: jQuery.isEmptyObject(value),
      valid: valid,
      errorMessage: message,
      errorVisible: errorVisible,
    });
  },

  handleBlur: function (event) {
    var valid = this.props.validate(event.target.value);
    this.validation(event.target.value, valid);
  },
  render: function () {
    if (this.props.textArea) {
      return (
        <div className={this.props.uniqueName}>
          <textarea
            placeholder={this.props.text}
            className={"input input-" + this.props.uniqueName}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            value={this.props.value}
          />

          <InputError
            visible={this.state.errorVisible}
            errorMessage={this.state.errorMessage}
          />
        </div>
      );
    } else {
      return (
        <div className={this.props.uniqueName}>
          <input
            type={this.props.inputType}
            name={this.props.uniqueName}
            id={this.props.uniqueName}
            placeholder={this.props.text}
            className={"input input-" + this.props.uniqueName}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            value={this.props.value}
          />

          <InputError
            visible={this.state.errorVisible}
            errorMessage={this.state.errorMessage}
          />
        </div>
      );
    }
  },
});

ReactDOM.render(<PlayerBox />, document.getElementById("content"));