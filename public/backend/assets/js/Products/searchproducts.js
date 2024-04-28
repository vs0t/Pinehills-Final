var ProductSearchBox = React.createClass({
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
  loadProductsFromServer: function (searchQuery) {
    $.ajax({
      url: "/searchproducts",
      data: searchQuery,
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ data: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/searchproducts", status, err.toString());
      }.bind(this),
    });
  },
  componentDidMount: function () {
    this.loadAllowLogin();
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
          <ProductSearchForm onProductSearch={this.loadProductsFromServer} />
          <br />
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Size</th>
              </tr>
            </thead>
            <ProductList data={this.state.data} />
          </table>
        </div>
      );
    }
  },
});

var ProductSearchForm = React.createClass({
  getInitialState: function () {
    return {
      productName: "",
      productDesc: "",
      productPrice: "",
      productSize: "",
    };
  },
  handleSubmit: function (e) {
    e.preventDefault();
    var searchQuery = {
      name: this.state.productName.trim(),
      desc: this.state.productDesc.trim(),
      price: this.state.productPrice.trim(),
      size: this.state.productSize.trim(),
    };
    this.props.onProductSearch(searchQuery);
  },
  handleChange: function (event) {
    var nextState = {};
    nextState[event.target.name] = event.target.value;
    this.setState(nextState);
  },
  render: function () {
    return (
      <form onSubmit={this.handleSubmit}>
        <h3>Use the Form below to search our product list.</h3>
        <input
          type="text"
          name="productName"
          value={this.state.productName}
          onChange={this.handleChange}
          placeholder="Product Name"
        />
        <input
          type="text"
          name="productDesc"
          value={this.state.productDesc}
          onChange={this.handleChange}
          placeholder="Product Description"
        />
        <input
          type="text"
          name="productPrice"
          value={this.state.productPrice}
          onChange={this.handleChange}
          placeholder="Product Price"
        />
        <input
          type="text"
          name="productSize"
          value={this.state.productSize}
          onChange={this.handleChange}
          placeholder="Product Size"
        />
        <input type="submit" value="Search Products" />
      </form>
    );
  },
});

var ProductList = React.createClass({
  render: function () {
    var productNodes = this.props.data.map(function (product) {
      return (
        <Product
          key={product.ProductID}
          productName={product.ProductName}
          productDesc={product.ProductDesc}
          productPrice={product.ProductPrice}
          productSize={product.ProductSize}
        />
      );
    });
    return <tbody>{productNodes}</tbody>;
  },
});

var Product = React.createClass({
  render: function () {
    return (
      <tr>
        <td>{this.props.productName}</td>
        <td>{this.props.productDesc}</td>
        <td>${this.props.productPrice}</td>
        <td>{this.props.productSize}</td>
      </tr>
    );
  },
});

ReactDOM.render(<ProductSearchBox />, document.getElementById("content"));
