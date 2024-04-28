var ProductBox = React.createClass({
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
  handleProductSubmit: function (eaProductEA) {
    $.ajax({
      url: "/insertproduct", // Your server endpoint to insert a product
      dataType: "json",
      type: "POST",
      data: eaProductEA,
      success: function (dataEA) {
        console.log("Product inserted successfully", dataEA);
        // Here you can handle the state update or redirection as needed
      },
      error: function (xhr, status, err) {
        console.error("/insertproduct", status, err.toString());
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
        <div className="productBox">
          <h1>Insert New Product</h1>
          <ProductForm onProductSubmit={this.handleProductSubmit} />
        </div>
      );
    }
  },
});

var ProductForm = React.createClass({
  getInitialState: function () {
    return {
      eaProductNameEA: "",
      eaProductDescEA: "",
      eaProductPriceEA: "",
      eaProductSizeEA: "",
    };
  },
  setValue: function (field, event) {
    var object = {};
    object[field] = event.target.value;
    this.setState(object);
  },
  handleSubmit: function (e) {
    e.preventDefault();
    this.props.onProductSubmit({
      productName: this.state.eaProductNameEA,
      productDesc: this.state.eaProductDescEA,
      productPrice: this.state.eaProductPriceEA,
      productSize: this.state.eaProductSizeEA,
    });
  },
  render: function () {
    return (
      <form className="productForm" onSubmit={this.handleSubmit}>
        <table>
          <tbody>
            <tr>
              <th>Product Name</th>
              <td>
                <TextInput
                  value={this.state.eaProductNameEA}
                  textArea={false}
                  required={true}
                  minCharacters={1}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "eaProductNameEA")}
                  errorMessage="Product Name is invalid"
                  emptyMessage="Product Name is required"
                />
              </td>
            </tr>
            <tr>
              <th>Product Description</th>
              <td>
                <TextInput
                  value={this.state.eaProductDescEA}
                  textArea={true}
                  required={false}
                  minCharacters={1}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "eaProductDescEA")}
                  errorMessage="Product Description is invalid"
                />
              </td>
            </tr>
            <tr>
              <th>Product Price</th>
              <td>
                <TextInput
                  value={this.state.eaProductPriceEA}
                  textArea={false}
                  required={true}
                  minCharacters={1}
                  validate={this.validateDollars}
                  onChange={this.setValue.bind(this, "eaProductPriceEA")}
                  errorMessage="Product Price is invalid"
                  emptyMessage="Product Price is required"
                />
              </td>
            </tr>
            <tr>
              <th>Product Size</th>
              <td>
                <TextInput
                  value={this.state.eaProductSizeEA}
                  textArea={false}
                  required={false}
                  minCharacters={1}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "eaProductSizeEA")}
                  errorMessage="Product Size is invalid"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <input type="submit" value="Insert Product" />
      </form>
    );
  },
  commonValidate: function () {
    return true;
  },
  validateDollars: function (value) {
    var regex = /^\$?[0-9]+(\.[0-9][0-9])?$/;
    return regex.test(value);
  },
});

var TextInput = React.createClass({
  getInitialState: function () {
    return {
      isEmpty: true,
      value: null,
      valid: false,
      errorMessage: "Input is invalid",
      errorVisible: false,
    };
  },
  handleChange: function (event) {
    this.validation(event.target.value);

    if (this.props.onChange) {
      this.props.onChange(event);
    }
  },
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

ReactDOM.render(<ProductBox />, document.getElementById("content"));
