var UserEditBox = React.createClass({
  getInitialState: function () {
    return {
      usersEA: [],
      selectedUserIdEA: null,
      selectedUserDetailsEA: null,
      dataEA: [],
      viewthepageEA: 0,
      searchQueryEA: {
        nameEA: "",
        lastnameEA: "",
        addressEA: "",
        cityEA: "",
        stateEA: "",
        zipEA: "",
        emailEA: "",
        userCatEA: "",
        userRoleEA: "",
      },
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
    this.fetchUsers();
    this.loadCatTypes();
    this.loadRoleTypes();
  },
  loadCatTypes: function () {
    $.ajax({
      url: "/getusercat",
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ categoryDataEA: data });
      }.bind(this),
    });
  },
  loadRoleTypes: function () {
    $.ajax({
      url: "/getuserrole",
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ roleDataEA: data });
      }.bind(this),
    });
  },
  handleSearch: function (searchQuery) {
    this.setState({ searchQueryEA: searchQuery }, () => {
      this.fetchUsers();
    });
  },
  fetchUsers: function () {
    const {
      nameEA,
      lastnameEA,
      addressEA,
      cityEA,
      stateEA,
      zipEA,
      emailEA,
      userCatEA,
      userRoleEA,
    } = this.state.searchQueryEA;
    const queryParams = new URLSearchParams({
      name: nameEA,
      lastname: lastnameEA,
      address: addressEA,
      city: cityEA,
      state: stateEA,
      zip: zipEA,
      email: emailEA,
      userCat: userCatEA,
      userRole: userRoleEA,
    }).toString();

    fetch(`/searchusers?${queryParams}`)
      .then((response) => response.json())
      .then((data) => this.setState({ usersEA: data }))
      .catch((error) => console.error("Error fetching users:", error));
  },
  selectUser: function (userId, userDetails) {
    this.setState({
      selectedUserIdEA: userId,
      selectedUserDetailsEA: userDetails,
    });
  },
  deleteUser: function (userId) {
    fetch(`/deleteuser/${userId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("User deleted successfully!");
        this.fetchUsers();
      })
      .catch((error) => console.error("Error deleting user:", error));
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
          <h1>User Edit</h1>
          <UserSearchForm onUserSearch={this.handleSearch} />
          <UserList
            users={this.state.usersEA}
            onSelectUser={this.selectUser}
            onDeleteUser={this.deleteUser}
          />
          {this.state.selectedUserIdEA && (
            <UserEditForm
              userId={this.state.selectedUserIdEA}
              userDetails={this.state.selectedUserDetailsEA}
              categoryData={this.state.categoryDataEA}
              roleData={this.state.roleDataEA}
            />
          )}
        </div>
      );
    }
  },
});

var UserList = React.createClass({
  render: function () {
    var userNodes = this.props.users.map((user) => (
      <User
        key={user.UserID}
        user={user}
        onSelectUser={this.props.onSelectUser}
        onDeleteUser={this.props.onDeleteUser}
      />
    ));
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>{userNodes}</tbody>
        </table>
      </div>
    );
  },
});

var User = React.createClass({
  handleClick: function () {
    this.props.onSelectUser(this.props.user.UserID, this.props.user);
  },
  handleDeleteClick: function () {
    this.props.onDeleteUser(this.props.user.UserID);
  },
  render: function () {
    const { UserID, UserFirstName, UserLastName, UserEmail } = this.props.user;
    return (
      <tr>
        <td>{UserID}</td>
        <td>{UserFirstName}</td>
        <td>{UserLastName}</td>
        <td>{UserEmail}</td>
        <td>
          <button onClick={this.handleClick}>Edit</button>
        </td>
        <td>
          <button onClick={this.handleDeleteClick}>Delete</button>
        </td>
      </tr>
    );
  },
});

var UserEditForm = React.createClass({
  getInitialState: function () {
    const {
      UserFirstName,
      UserLastName,
      UserEmail,
      UserAddress,
      UserCity,
      UserState,
      UserZip,
      RoleID,
      CatagoryID,
    } = this.props.userDetails;
    return {
      firstNameEA: UserFirstName || "",
      lastNameEA: UserLastName || "",
      emailEA: UserEmail || "",
      addressEA: UserAddress || "",
      cityEA: UserCity || "",
      stateEA: UserState || "",
      zipEA: UserZip || "",
      roleIdEA: RoleID || "",
      categoryIdEA: CatagoryID || "",
      uproleDataEA: this.props.roleData || [],
      upcategoryDataEA: this.props.categoryData || [],
    };
  },
  componentDidUpdate: function (prevProps) {
    if (this.props.userId !== prevProps.userId) {
      const {
        UserFirstName,
        UserLastName,
        UserEmail,
        UserAddress,
        UserCity,
        UserState,
        UserZip,
        RoleID,
        CatagoryID,
      } = this.props.userDetails;

      this.setState({
        firstNameEA: UserFirstName || "",
        lastNameEA: UserLastName || "",
        emailEA: UserEmail || "",
        addressEA: UserAddress || "",
        cityEA: UserCity || "",
        stateEA: UserState || "",
        zipEA: UserZip || "",
        roleIdEA: RoleID || "",
        categoryIdEA: CatagoryID || "",
      });
    }
  },
  handleSubmit: function (event) {
    event.preventDefault();
    const userData = {
      userId: this.props.userId,
      firstName: this.state.firstNameEA,
      lastName: this.state.lastNameEA,
      email: this.state.emailEA,
      address: this.state.addressEA,
      city: this.state.cityEA,
      state: this.state.stateEA,
      zip: this.state.zipEA,
      roleId: this.state.roleIdEA,
      categoryId: this.state.categoryIdEA,
    };

    fetch("/updateuser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("User updated successfully!");
        window.location.reload();
      })
      .catch((error) => console.error("Error updating user:", error));
  },
  handleChange: function (event) {
    var stateUpdate = {};
    stateUpdate[event.target.name] = event.target.value;
    this.setState(stateUpdate);
  },
  handleRoleChange: function (selectedRoleId) {
    this.setState({ roleIdEA: selectedRoleId });
  },
  handleCategoryChange: function (event) {
    this.setState({ categoryIdEA: event.target.value });
  },
  render: function () {
    return (
      <div>
        <h2>Edit User ID: {this.props.userId}</h2>
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
            Role ID:
            <SelectList2
              data={this.state.uproleDataEA}
              onRoleChange={this.handleRoleChange}
              value={this.state.roleIdEA}
            />
          </label>
          <br />
          <label>
            Category ID:
            <SelectList
              data={this.state.upcategoryDataEA}
              onChange={this.handleCategoryChange}
              value={this.state.categoryIdEA}
            />
          </label>
          <br />
          <button type="submit">Submit User Update</button>
        </form>
      </div>
    );
  },
});

var UserSearchForm = React.createClass({
  getInitialState: function () {
    return {
      nameEA: "",
      lastnameEA: "",
      addressEA: "",
      cityEA: "",
      stateEA: "",
      zipEA: "",
      emailEA: "",
      categoryDataEA: [],
      roleDataEA: [],
      userCatEA: "",
      userRoleEA: "",
    };
  },
  handleCategoryChange: function (event) {
    this.setState({ userCatEA: event.target.value });
  },
  handleRoleChange: function (selectedRole) {
    this.setState({ userRoleEA: selectedRole });
  },
  loadCatTypes: function () {
    $.ajax({
      url: "/getusercat",
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ categoryDataEA: data });
      }.bind(this),
    });
  },
  loadRoleTypes: function () {
    $.ajax({
      url: "/getuserrole",
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ roleDataEA: data });
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
      nameEA: this.state.nameEA.trim(),
      lastnameEA: this.state.lastnameEA.trim(),
      addressEA: this.state.addressEA.trim(),
      cityEA: this.state.cityEA.trim(),
      stateEA: this.state.stateEA.trim(),
      zipEA: this.state.zipEA.trim(),
      emailEA: this.state.emailEA.trim(),
      userCatEA: this.state.userCatEA,
      userRoleEA: this.state.userRoleEA,
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
                  name="nameEA"
                  id="nameEA"
                  value={this.state.nameEA}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>Last Name</th>
              <td>
                <input
                  type="text"
                  name="lastnameEA"
                  id="lastnameEA"
                  value={this.state.lastnameEA}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>Address</th>
              <td>
                <input
                  type="text"
                  name="addressEA"
                  id="addressEA"
                  value={this.state.addressEA}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>City</th>
              <td>
                <input
                  type="text"
                  name="cityEA"
                  id="cityEA"
                  value={this.state.cityEA}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>State</th>
              <td>
                <input
                  type="text"
                  name="stateEA"
                  id="stateEA"
                  value={this.state.stateEA}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>Zip</th>
              <td>
                <input
                  type="text"
                  name="zipEA"
                  id="zipEA"
                  value={this.state.zipEA}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>Email</th>
              <td>
                <input
                  type="text"
                  name="emailEA"
                  id="emailEA"
                  value={this.state.emailEA}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>Category</th>
              <td>
                <SelectList
                  data={this.state.categoryDataEA}
                  onChange={this.handleCategoryChange}
                />
              </td>
            </tr>
            <tr>
              <th>Role</th>
              <td>
                <SelectList2
                  data={this.state.roleDataEA}
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

var SelectList = React.createClass({
  handleChange: function (event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  },
  render: function () {
    return (
      <select
        name="userCatEA"
        id="userCatEA"
        value={this.props.value} // Use the value prop as the default selected value
        onChange={this.handleChange}
      >
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
    return (
      <select
        name="userRoleEA"
        id="userRoleEA"
        value={this.props.value} // Use the value prop as the default selected value
        onChange={this.handleChange}
      >
        <option value=""></option>
        {this.props.data.map(function (cusParticipant) {
          return (
            <option key={cusParticipant.RoleID} value={cusParticipant.RoleID}>
              {cusParticipant.RoleName}
            </option>
          );
        })}
      </select>
    );
  },
});

ReactDOM.render(<UserEditBox />, document.getElementById("content"));
