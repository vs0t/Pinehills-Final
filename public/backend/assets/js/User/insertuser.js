var EmployeeBox = React.createClass({
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
  // beggining of call to backend
  handleEmployeeSubmit: function (employeeEA) {
    $.ajax({
      url: "/insertuser",
      dataType: "json",
      type: "POST",
      data: employeeEA,
      success: function (dataEA) {
        this.setState({ data: dataEA });
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
    if (
      this.state.viewthepage == 0 ||
      this.state.viewthepage !== 2
    ) {
      return (
        <div id="error">
          You do not have access to this page, contact the Systems Admin if you
          need access but don't have it.
        </div>
      );
    } else {
      return (
        <div className="EmployeeBox">
          {/* <h1>Users</h1> */}
          <Employeeform2 onEmployeeSubmit={this.handleEmployeeSubmit} />
        </div>
      );
    }
  },
});

var Employeeform2 = React.createClass({
  // set state for all to blank data being submitted
  getInitialState: function () {
    return {
      employeenameEA: "",
      employeelastnameEA: "",
      employeeaddressEA: "",
      employeezipEA: "",
      employeecityEA: "",
      employeestateEA: "",
      employeeemailEA: "",
      employeepwEA: "",
      employeepw2EA: "",
      categoryDataEA: [],
      roleDataEA: [],
      userCatEA: "",
      userRoleEA: "",
    };
  },
  handleOptionChange: function (e) {
    this.setState({
      // on change of reward choice, update value for insert
      selectedOption: e.target.value,
    });
  },
  // ajax call to backend to get user catagory options
  loadCatTypes: function () {
    $.ajax({
      url: "/getusercat",
      dataType: "json",
      cache: false,
      success: function (dataEA) {
        this.setState({ categoryDataEA: dataEA });
      }.bind(this),
    });
  },
  // ajax call to backend to get user role types options
  loadRoleTypes: function () {
    $.ajax({
      url: "/getuserrole",
      dataType: "json",
      cache: false,
      success: function (dataEA) {
        this.setState({ roleDataEA: dataEA });
      }.bind(this),
    });
  },
  // on change of catagory by user, set its state to it can be submitted
  handleCategoryChange: function (event) {
    this.setState({ userCatEA: event.target.value });
  },

  // on change of role by user, set its state to it can be submitted
  handleRoleChange: function (selectedRoleEA) {
    this.setState({ userRoleEA: selectedRoleEA });
  },

  // perform backend calls to grab role and catagories on load of page
  componentDidMount: function () {
    this.loadCatTypes();
    this.loadRoleTypes();
  },

  handleSubmit: function (e) {
    // prevent default and grab all data from the HTML forms for submission, trim to remove whitespace
    e.preventDefault();

    var employeenameEA = this.state.employeenameEA.trim();
    var employeelastnameEA = this.state.employeelastnameEA.trim();
    var employeeaddressEA = this.state.employeeaddressEA.trim();
    var employeezipEA = this.state.employeezipEA.trim();
    var employeecreditEA = this.state.employeecreditEA;
    var employeecityEA = this.state.employeecityEA;
    var employeestateEA = this.state.employeestateEA;
    var employeeemailEA = this.state.employeeemailEA.trim();
    var employeepwEA = this.state.employeepwEA.trim();
    var employeepw2EA = this.state.employeepw2EA.trim();
    var userCatEA = this.state.userCatEA;
    var userRoleEA = this.state.userRoleEA;

    console.log("email: " + employeeemailEA);

    // validate its an email address
    if (!this.validateEmail(employeeemailEA)) {
      console.log("Bad Email " + this.validateEmail(employeeemailEA));
      return;
    }

    // make user enter name and email, or else they cannot submit
    if (!employeenameEA || !employeeemailEA) {
      console.log("Field Missing");
      return;
    }

    // alert user if passwords dont match, do not allow submission until fixed
    if (employeepwEA != employeepw2EA) {
      alert("Passwords do not match.");
      return;
    }

    this.props.onEmployeeSubmit({
      // on submission, assign grabbed values to variable names for submission into ajax and the DB
      employeename: employeenameEA,
      employeelastname: employeelastnameEA,
      employeeaddress: employeeaddressEA,
      employeecity: employeecityEA,
      employeestate: employeestateEA,
      employeezip: employeezipEA,
      employeeemail: employeeemailEA,
      employeepw: employeepwEA,
      userCat: userCatEA,
      userRole: userRoleEA,
    });
  },

  // validate email
  validateEmail: function (value) {
    var re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(value);
  },
  // validate cost
  validateDollars: function (value) {
    var regex = /^\$?[0-9]+(\.[0-9][0-9])?$/;
    return regex.test(value);
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
    // code to display the form for submission
    return (
      <form className="employeeForm" onSubmit={this.handleSubmit}>
        <h2>User Information Area</h2>
        <table>
          <tbody>
            <tr>
              <th>User First Name</th>
              <td>
                <TextInput
                  value={this.state.employeenameEA}
                  uniqueName="employeenameEA"
                  textArea={false}
                  required={true}
                  minCharacters={1}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "employeenameEA")}
                  errorMessage="Employee Name is invalid"
                  emptyMessage="Employee Name is required"
                />
              </td>
            </tr>
            <tr>
              <th>User Last Name</th>
              <td>
                <TextInput
                  value={this.state.employeelastnameEA}
                  uniqueName="employeelastnameEA"
                  textArea={false}
                  required={true}
                  minCharacters={1}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "employeelastnameEA")}
                  errorMessage="Employee Name is invalid"
                  emptyMessage="Employee Name is required"
                />
              </td>
            </tr>
            <tr>
              <th>User Address</th>
              <td>
                <TextInput
                  value={this.state.employeeaddressEA}
                  uniqueName="employeeaddressEA"
                  textArea={false}
                  required={false}
                  minCharacters={6}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "employeeaddressEA")}
                  errorMessage="Employee Address is invalid"
                />
              </td>
            </tr>
            <tr>
              <th>User City</th>
              <td>
                <TextInput
                  value={this.state.employeecityEA}
                  uniqueName="employeecityEA"
                  textArea={false}
                  required={false}
                  minCharacters={6}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "employeecityEA")}
                  errorMessage="Employee Address is invalid"
                />
              </td>
            </tr>
            <tr>
              <th>User Zip</th>
              <td>
                <TextInput
                  value={this.state.employeezipEA}
                  uniqueName="employeezipEA"
                  textArea={false}
                  required={false}
                  minCharacters={5}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "employeezipEA")}
                  errorMessage=""
                  emptyMessage=""
                />
              </td>
            </tr>
            <tr>
              <th>User State</th>
              <td>
                <TextInput
                  value={this.state.employeestateEA}
                  uniqueName="employeestateEA"
                  textArea={false}
                  minCharacters={2}
                  required={false}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "employeestateEA")}
                  errorMessage=""
                  emptyMessage=""
                />
              </td>
            </tr>
            <tr>
              <th>Employee E-Mail</th>
              <td>
                <TextInput
                  value={this.state.employeeemailEA}
                  uniqueName="employeeemailEA"
                  textArea={false}
                  minCharacters={1}
                  required={true}
                  validate={this.validateEmail}
                  onChange={this.setValue.bind(this, "employeeemailEA")}
                  errorMessage="Invalid E-Mail Address"
                  emptyMessage="E-Mail Address is Required"
                />
              </td>
            </tr>
            <tr>
              <th>Employee Password</th>
              <td>
                <TextInput
                  inputType="password"
                  value={this.state.employeepwEA}
                  uniqueName="employeepwEA"
                  textArea={false}
                  required={true}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "employeepwEA")}
                  errorMessage="Invalid Password"
                  emptyMessage="Password is Required"
                />
              </td>
            </tr>
            <tr>
              <th>Employee Password Confirm</th>
              <td>
                <TextInput
                  inputType="password"
                  value={this.state.employeepw2EA}
                  uniqueName="employeepw2EA"
                  textArea={false}
                  required={true}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "employeepw2EA")}
                  errorMessage="Invalid Password"
                  emptyMessage="Password is Required"
                />
              </td>
            </tr>
            <tr>
              <th>Catagory</th>
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
        <input type="submit" value="Insert Employee" />
      </form>
    );
  },
});

// dropdown for user to select the catagory
var SelectList = React.createClass({
  handleChange: function (event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  },
  render: function () {
    return (
      <select name="userCat" id="userCat" onChange={this.handleChange}>
        <option value="">No Catagory</option>
        {/* map the pulled DB data and assign it to the dropdown
        so that on submit, it uses the value but for display, shows the 
        english name */}
        {this.props.data.map(function (cusParticipantEA) {
          return (
            <option
              key={cusParticipantEA.CatagoryID}
              value={cusParticipantEA.CatagoryID}
            >
              {cusParticipantEA.CatagoryName}
            </option>
          );
        })}
      </select>
    );
  },
});

// dropdown for selecting role
var SelectList2 = React.createClass({
  handleChange: function (event) {
    const selectedRoleIdEA = event.target.value;

    if (this.props.onRoleChange) {
      this.props.onRoleChange(selectedRoleIdEA);
    } else {
      console.error("onRoleChange prop not passed to SelectList2");
    }
  },

  render: function () {
    {
      /* map the pulled DB data and assign it to the dropdown
        so that on submit, it uses the value but for display, shows the 
        english name */
    }
    var optionNodes = this.props.data.map(function (cusParticipantEA) {
      return (
        <option key={cusParticipantEA.RoleID} value={cusParticipantEA.RoleID}>
          {cusParticipantEA.RoleName}
        </option>
      );
    });
    return (
      <select name="userRole" id="userRole" onChange={this.handleChange}>
        <option value="">No Role</option>
        {optionNodes}
      </select>
    );
  },
});

// input error class so that the user is alerted when the information being submitted is insuffecient
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

// class for managing text input fields, including validation and error handling.
var TextInput = React.createClass({
  // initializes component state with default values for form handling.
  getInitialState: function () {
    return {
      isEmpty: true,
      value: null,
      valid: false,
      errorMessage: "",
      errorVisible: false,
    };
  },

  // handles change events for the input, performs validation, and triggers onChange prop if provided.
  handleChange: function (event) {
    // validates the input value and updates the component state accordingly.
    this.validation(event.target.value);

    // if an onChange handler is provided via props, it's called with the event.
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  },

  // validates the input value against the provided criteria and sets the component state.
  validation: function (value, valid) {
    // sets a default validity state if not explicitly provided.
    if (typeof valid === "undefined") {
      valid = true;
    }

    var message = "";
    var errorVisible = false;

    // determines the validity based on custom logic and updates state with the validation result.
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

    // updates the component state with the new validation status and error message if any.
    this.setState({
      value: value,
      isEmpty: jQuery.isEmptyObject(value),
      valid: valid,
      errorMessage: message,
      errorVisible: errorVisible,
    });
  },

  // handles blur events to perform final validation using custom logic provided via props.
  handleBlur: function (event) {
    // validates the input when it loses focus and updates the state based on the result.
    var valid = this.props.validate(event.target.value);
    this.validation(event.target.value, valid);
  },
  render: function () {
    // renders a text area or a single-line input based on the textArea prop.
    if (this.props.textArea) {
      return (
        <div className={this.props.uniqueName}>
          {/* renders a text area with error handling. */}
          <textarea
            placeholder={this.props.text}
            className={"input input-" + this.props.uniqueName}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            value={this.props.value}
          />

          {/* component for displaying input validation errors. */}
          <InputError
            visible={this.state.errorVisible}
            errorMessage={this.state.errorMessage}
          />
        </div>
      );
    } else {
      return (
        <div className={this.props.uniqueName}>
          {/* renders a single-line input with error handling. */}
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

          {/* component for displaying input validation errors. */}
          <InputError
            visible={this.state.errorVisible}
            errorMessage={this.state.errorMessage}
          />
        </div>
      );
    }
  },
});

ReactDOM.render(<EmployeeBox />, document.getElementById("content"));
