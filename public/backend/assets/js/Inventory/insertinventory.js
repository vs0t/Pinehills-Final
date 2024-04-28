// inventory box component
var InventoryBox = React.createClass({
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
  // handle inventory submission
  handleInventorySubmit: function (inventoryEA) {
    // ajax call to insert inventory
    $.ajax({
      url: "/insertinventory",
      dataType: "json",
      type: "POST",
      data: inventoryEA,
      success: function (dataEA) {
        console.log("Inventory inserted successfully", dataEA);
        // handle state update or redirection here
      },
      error: function (xhr, status, err) {
        console.error("/insertinventory", status, err.toString());
      },
    });
  },
  componentDidMount: function () {
    this.loadAllowLogin();
  },
  render: function () {
    if (this.state.viewthepage == 0 || this.state.viewthepage !== 2) {
      return (
        <div id="error">
          You do not have access to this page, contact the Systems Admin if you
          need access but don't have it.
        </div>
      );
    } else {
      return (
        <div className="inventoryBox">
          <h1>Record New Inventory Form</h1>
          {/* inventory form component */}
          <InventoryForm onInventorySubmit={this.handleInventorySubmit} />
        </div>
      );
    }
  },
});

// inventory form component
var InventoryForm = React.createClass({
  // initial state
  getInitialState: function () {
    return {
      inventoryQuantityEA: "",
      productDataEA: [],
      selectedProductIdEA: "",
    };
  },
  // load product options
  loadProductOptions: function () {
    // ajax call to search products
    $.ajax({
      url: "/searchproducts",
      dataType: "json",
      cache: false,
      success: function (dataEA) {
        this.setState({ productDataEA: dataEA });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/searchproductsandinventory", status, err.toString());
      }.bind(this),
    });
  },
  // load product options on component mount
  componentDidMount: function () {
    this.loadProductOptions();
  },
  // handle product change
  handleProductChange: function (event) {
    this.setState({ selectedProductIdEA: event.target.value });
  },
  // set state value
  setValue: function (field, event) {
    var object = {};
    object[field] = event.target.value;
    this.setState(object);
  },
  // handle form submission
  handleSubmit: function (e) {
    e.preventDefault();
    var inventoryQuantityEA = this.state.inventoryQuantityEA.trim();
    var selectedProductIdEA = this.state.selectedProductIdEA;

    // simple validation
    if (!inventoryQuantityEA || !selectedProductIdEA) {
      console.log("All fields are required.");
      return;
    }

    this.props.onInventorySubmit({
      inventoryQuantity: inventoryQuantityEA,
      productID: selectedProductIdEA,
    });
  },
  render: function () {
    return (
      <form className="inventoryForm" onSubmit={this.handleSubmit}>
        <h2>Inventory Record Form</h2>
        <table>
          <tbody>
            <tr>
              <th>Product ID</th>
              <td>
                {/* select list component */}
                <SelectList
                  data={this.state.productDataEA}
                  onChange={this.handleProductChange}
                />
              </td>
            </tr>
            <tr>
              <th>Inventory Quantity</th>
              <td>
                {/* text input component */}
                <TextInput
                  value={this.state.inventoryQuantityEA}
                  uniqueName="inventoryQuantityEA"
                  textArea={false}
                  required={true}
                  minCharacters={1}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "inventoryQuantityEA")}
                  errorMessage="Inventory Quantity is invalid"
                  emptyMessage="Inventory Quantity is required"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <input type="submit" value="Insert Inventory" />
      </form>
    );
  },
  // common validation
  commonValidate: function (value) {
    return /^\d+$/.test(value); // validation for numeric input
  },
});

// select list component
var SelectList = React.createClass({
  handleChange: function (event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  },
  render: function () {
    var options = this.props.data.map(function (productEA) {
      return (
        <option key={productEA.ProductID} value={productEA.ProductID}>
          {productEA.ProductName}
        </option>
      );
    });
    return (
      <select name="productID" id="productID" onChange={this.handleChange}>
        <option value="">Select a Product</option>
        {options}
      </select>
    );
  },
});

// text input component
var TextInput = React.createClass({
  // initial state
  getInitialState: function () {
    return {
      isEmpty: true,
      value: null,
      valid: false,
      errorMessage: "Input is invalid",
      errorVisible: false,
    };
  },
  // handle change
  handleChange: function (event) {
    this.validation(event.target.value);

    if (this.props.onChange) {
      this.props.onChange(event);
    }
  },
  // validation logic
  validation: function (value) {
    var valid = this.props.validate(value);
    var message = "";
    var errorVisible = false;

    if (!valid) {
      message = this.props.errorMessage;
      errorVisible = true;
    } else if (this.props.required && !value) {
      message = this.props.emptyMessage;
      errorVisible = true;
    } else if (value.length < this.props.minCharacters) {
      message = this.props.errorMessage;
      errorVisible = true;
    }

    this.setState({
      value: value,
      isEmpty: !value,
      valid: valid,
      errorMessage: message,
      errorVisible: errorVisible,
    });
  },
  // handle blur
  handleBlur: function (event) {
    this.validation(event.target.value);
  },
  render: function () {
    var errorClass = classNames({
      error_container: true,
      visible: this.state.errorVisible,
      invisible: !this.state.errorVisible,
    });

    var inputClass = "input-" + this.props.uniqueName;
    return (
      <div className={inputClass}>
        <input
          type={this.props.inputType || "text"}
          name={this.props.uniqueName}
          placeholder={this.props.uniqueName}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          value={this.state.value}
        />
        <div className={errorClass}>{this.state.errorMessage}</div>
      </div>
    );
  },
});

// render inventory box
ReactDOM.render(<InventoryBox />, document.getElementById("content"));
