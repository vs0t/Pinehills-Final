var LoginOrderBox = React.createClass({
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
          <OrderBox playerId={this.state.loggedInPlayerId} />
        </div>
      );
    } else {
      return (
        <div>
          <h1>Login</h1>
          <LoginForm onLoginSubmit={this.handleLogin} />
          <br />
        </div>
      );
    }
  }
});

var OrderBox = React.createClass({
  getInitialState: function () {
    return {
      productDataEA: [],
      selectedProductPriceEA: "",
    };
  },

  loadProductOptions: function () {
    $.ajax({
      url: "/searchproducts",
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
    this.loadProductOptions();
  },

  handleOrderSubmit: function (orderEA) {
    orderEA.userId = this.props.playerId;

    $.ajax({
      url: "/insertorder",
      dataType: "json",
      type: "POST",
      data: orderEA,
      success: function (dataEA) {
        console.log('Order inserted successfully');
        alert(dataEA.message);
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/insertorder", status, err.toString());
      }.bind(this),
    });
  },

  render: function () {
    return (
      <div className="orderBox">
        <h2>Place New Order</h2>
        <OrderForm
          onOrderSubmit={this.handleOrderSubmit}
          productData={this.state.productDataEA}
        />
      </div>
    );
  },
});

var OrderForm = React.createClass({
  getInitialState: function () {
    return {
      selectedProductIdEA: "",
      quantityEA: "",
    };
  },

  handleProductChange: function (valueEA) {
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
    var orderDate = currentDate.toISOString().split("T")[0];
    var orderTime = currentDate.toTimeString().split(" ")[0];
    var orderEA = {
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

ReactDOM.render(<LoginOrderBox />, document.getElementById("content"));