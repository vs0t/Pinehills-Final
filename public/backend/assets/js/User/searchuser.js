var UserSearchBox = React.createClass({
  getInitialState: function () {
    return { data: [], viewthepage: 0 };
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
  loadUsersFromServer: function (searchQuery) {
    $.ajax({
      url: "/searchusers",
      data: searchQuery,
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ data: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },
  componentDidMount: function () {
    this.loadAllowLogin();
  },
  render: function () {
    if (this.state.viewthepage == 0 || this.state.viewthepage !== 2 && this.state.viewthepage !== 6) {
      return (
        <div id="error">
          You do not have access to this page, contact the Systems Admin if you
          need access but don't have it.
        </div>
      );
    } else {
      return (
        <div>
          <UserSearchForm onUserSearch={this.loadUsersFromServer} />
          <br />
          <table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Address</th>
                <th>City</th>
                <th>State</th>
                <th>Zip</th>
                <th>Email</th>
                <th>Category</th>
                <th>Role</th>
              </tr>
            </thead>
            <UserList data={this.state.data} />
          </table>
        </div>
      );
    }
  },
});

var UserSearchForm = React.createClass({
  getInitialState: function () {
    return {
      name: "",
      lastname: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      email: "",
      categoryData: [],
      roleData: [],
      userCat: "",
      userRole: "",
    };
  },
  handleCategoryChange: function (event) {
    this.setState({ userCat: event.target.value });
  },
  handleRoleChange: function (selectedRole) {
    this.setState({ userRole: selectedRole });
  },
  loadCatTypes: function () {
    $.ajax({
      url: "/getusercat",
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ categoryData: data });
      }.bind(this),
    });
  },
  loadRoleTypes: function () {
    $.ajax({
      url: "/getuserrole",
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ roleData: data });
      }.bind(this),
    });
  },
  componentDidMount: function () {
    this.loadCatTypes();
    this.loadRoleTypes();
  },
  handleSubmit: function (e) {
    e.preventDefault();

    var searchQuery = {
      name: this.state.name.trim(),
      lastname: this.state.lastname.trim(),
      address: this.state.address.trim(),
      city: this.state.city.trim(),
      state: this.state.state.trim(),
      zip: this.state.zip.trim(),
      email: this.state.email.trim(),
      userCat: this.state.userCat,
      userRole: this.state.userRole,
    };

    this.props.onUserSearch(searchQuery);
  },
  handleChange: function (event) {
    this.setState({
      [event.target.id]: event.target.value,
    });
  },
  render: function () {
    return (
      <form onSubmit={this.handleSubmit}>
        <h2>User Search</h2>
        <table>
          <tbody>
            <tr>
              <th>First Name</th>
              <td>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={this.state.name}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>Last Name</th>
              <td>
                <input
                  name="lastname"
                  id="lastname"
                  value={this.state.lastname}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>Address</th>
              <td>
                <input
                  name="address"
                  id="address"
                  value={this.state.address}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>City</th>
              <td>
                <input
                  name="city"
                  id="city"
                  value={this.state.city}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>State</th>
              <td>
                <input
                  name="state"
                  id="state"
                  value={this.state.state}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>Zip</th>
              <td>
                <input
                  name="zip"
                  id="zip"
                  value={this.state.zip}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>Email</th>
              <td>
                <input
                  name="email"
                  id="email"
                  value={this.state.email}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>Category</th>
              <td>
                <SelectList
                  data={this.state.categoryData}
                  onChange={this.handleCategoryChange}
                />
              </td>
            </tr>
            <tr>
              <th>Role</th>
              <td>
                <SelectList2
                  data={this.state.roleData}
                  onRoleChange={this.handleRoleChange}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <input type="submit" value="Search Users" />
      </form>
    );
  },
});

var UserList = React.createClass({
  render: function () {
    var userNodes = this.props.data.map(function (user) {
      return (
        <User
          key={user.UserID}
          UserFirstName={user.UserFirstName}
          UserLastName={user.UserLastName}
          UserAddress={user.UserAddress}
          UserCity={user.UserCity}
          UserState={user.UserState}
          UserZip={user.UserZip}
          UserEmail={user.UserEmail}
          Category={user.Category}
          Role={user.Role}
        />
      );
    });

    return <tbody>{userNodes}</tbody>;
  },
});

var User = React.createClass({
  render: function () {
    return (
      <tr>
        <td>{this.props.UserFirstName}</td>
        <td>{this.props.UserLastName}</td>
        <td>{this.props.UserAddress}</td>
        <td>{this.props.UserCity}</td>
        <td>{this.props.UserState}</td>
        <td>{this.props.UserZip}</td>
        <td>{this.props.UserEmail}</td>
        <td>{this.props.Category}</td>
        <td>{this.props.Role}</td>
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
      <select name="userCat" id="userCat" onChange={this.handleChange}>
        <option value=""></option>
        {this.props.data.map(function (cusParticipant) {
          return (
            <option
              key={cusParticipant.CatagoryID}
              value={cusParticipant.CatagoryID}
            >
              {cusParticipant.CatagoryName}
            </option>
          );
        })}
      </select>
    );
  },
});

var SelectList2 = React.createClass({
  handleChange: function (event) {
    const selectedRoleId = event.target.value;

    if (this.props.onRoleChange) {
      this.props.onRoleChange(selectedRoleId);
    } else {
      console.error("onRoleChange prop not passed to SelectList2");
    }
  },

  render: function () {
    var optionNodes = this.props.data.map(function (cusParticipant) {
      return (
        <option key={cusParticipant.RoleID} value={cusParticipant.RoleID}>
          {cusParticipant.RoleName}
        </option>
      );
    });
    return (
      <select name="userRole" id="userRole" onChange={this.handleChange}>
        <option value=""></option>
        {optionNodes}
      </select>
    );
  },
});

ReactDOM.render(<UserSearchBox />, document.getElementById("content"));
