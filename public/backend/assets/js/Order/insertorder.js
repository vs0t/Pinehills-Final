var OrderBox = React.createClass({
  getInitialState: function () {
    return {
      userDataEA: [],
      productDataEA: [],
      selectedProductPriceEA: "",
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
        console.error("/searchusers", status, err.toString());
      }.bind(this),
    });
  },
  loadProductOptions: function () {
    // Fetch the product options
    $.ajax({
      url: "/searchproducts", // Endpoint to fetch products
      dataType: "json",
      cache: false,
      success: function (dataEA) {
        this.setState({ productDataEA: dataEA });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/searchproducts", status, err.toString());
      }.bind(this),
    });
  },
  componentDidMount: function () {
    this.loadUserOptions();
    this.loadProductOptions();
    this.loadAllowLogin();
  },
  handleOrderSubmit: function (orderEA) {
    // Include the AJAX call to the server endpoint here to insert the order data
    $.ajax({
      url: "/insertorder",
      dataType: "json",
      type: "POST",
      data: orderEA,
      success: function (dataEA) {
        console.log("Order inserted successfully");
        alert(dataEA.message);
        // Handle success such as informing user the order was successful
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/insertorder", status, err.toString());
      }.bind(this),
    });
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
        <div className="orderBox">
          <h2>Place New Order</h2>
          <OrderForm
            onOrderSubmit={this.handleOrderSubmit}
            userData={this.state.userDataEA}
            productData={this.state.productDataEA}
          />
        </div>
      );
    }
  },
});

var OrderForm = React.createClass({
  getInitialState: function () {
    return {
      selectedUserIdEA: "",
      selectedProductIdEA: "",
      quantityEA: "",
    };
  },
  handleUserChange: function (valueEA) {
    this.setState({ selectedUserIdEA: valueEA });
  },
  // handleProductChange: function (value) {
  //   this.setState({ selectedProductId: value });
  // },
  handleProductChange: function (valueEA) {
    // Find the selected product and its price
    var selectedProductEA = this.props.productData.find(
      (productEA) => productEA.ProductID.toString() === valueEA
    );
    var selectedProductPriceEA = selectedProductEA
      ? selectedProductEA.ProductPrice
      : "";

    this.setState({
      selectedProductIdEA: valueEA,
      selectedProductPriceEA: selectedProductPriceEA,
    });
  },
  handleQuantityChange: function (event) {
    this.setState({ quantityEA: event.target.value });
  },
  handleSubmit: function (e) {
    e.preventDefault();
    var currentDate = new Date();
    var orderDate = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD
    var orderTime = currentDate.toTimeString().split(" ")[0]; // HH:MM:SS
    var orderEA = {
      userId: this.state.selectedUserIdEA,
      productId: this.state.selectedProductIdEA,
      quantity: this.state.quantityEA,
      price: this.state.selectedProductPriceEA,
      date: orderDate,
      time: orderTime,
      orderStatus: 0,
    };
    this.props.onOrderSubmit(orderEA);
  },
  render: function () {
    return (
      <form className="orderForm" onSubmit={this.handleSubmit}>
        <table>
          <tbody>
            <tr>
              <th>Select User</th>
              <td>
                <SelectList
                  data={this.props.userData}
                  onChange={this.handleUserChange}
                />
              </td>
            </tr>
            <tr>
              <th>Select Product</th>
              <td>
                <SelectList2
                  data={this.props.productData}
                  onProductChange={this.handleProductChange}
                />
              </td>
            </tr>
            <tr>
              <th>Quantity</th>
              <td>
                <TextInput
                  inputType="number"
                  value={this.state.quantityEA}
                  uniqueName="quantityEA"
                  textArea={false}
                  required={true}
                  minCharacters={1}
                  validate={this.commonValidate}
                  onChange={this.handleQuantityChange}
                  errorMessage="Quantity is invalid"
                  emptyMessage="Quantity is required"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <input type="submit" value="Insert Order" />
      </form>
    );
  },
  commonValidate: function () {
    return true;
  },
});

var SelectList = React.createClass({
  handleChange: function (event) {
    if (this.props.onChange) {
      this.props.onChange(event.target.value);
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
      <select name="userSelect" onChange={this.handleChange}>
        <option value="">Select Player</option>
        {options}
      </select>
    );
  },
});

var SelectList2 = React.createClass({
  handleChange: function (event) {
    if (this.props.onProductChange) {
      this.props.onProductChange(event.target.value);
    }
  },
  render: function () {
    var options = this.props.data.map(function (itemEA) {
      return (
        <option key={itemEA.ProductID} value={itemEA.ProductID}>
          {itemEA.ProductName}
        </option>
      );
    });
    return (
      <select name="productSelect" onChange={this.handleChange}>
        <option value="">Select Product</option>
        {options}
      </select>
    );
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
ReactDOM.render(<OrderBox />, document.getElementById("content"));
