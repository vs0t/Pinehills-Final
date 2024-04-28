var ProductEditBox = React.createClass({
  getInitialState: function () {
    return {
      productsEA: [],
      selectedProductIdEA: null,
      selectedProductDetailsEA: null,
      dataEA: [],
      viewthepageEA: 0,
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
    this.fetchProducts();
  },
  fetchProducts: function (searchQuery) {
    $.ajax({
      url: "/searchproducts",
      data: searchQuery,
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ productsEA: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("Error fetching products:", err.toString());
      }.bind(this),
    });
  },
  selectProduct: function (productId, productDetails) {
    this.setState({
      selectedProductIdEA: productId,
      selectedProductDetailsEA: productDetails,
    });
  },
  deleteProduct: function (productId) {
    fetch(`/deleteproduct/${productId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("Product deleted successfully!");
        this.fetchProducts();
      })
      .catch((error) => console.error("Error deleting product:", error));
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
          {/* <h1>Product Edit</h1> */}
          <ProductSearchForm onProductSearch={this.fetchProducts} />
          <ProductList
            products={this.state.productsEA}
            onSelectProduct={this.selectProduct}
            onDeleteProduct={this.deleteProduct}
          />
          {this.state.selectedProductIdEA && (
            <ProductEditForm
              productId={this.state.selectedProductIdEA}
              productDetails={this.state.selectedProductDetailsEA}
            />
          )}
        </div>
      );
    }
  },
});

var ProductList = React.createClass({
  render: function () {
    var productNodes = this.props.products.map((product) => (
      <Product
        key={product.ProductID}
        product={product}
        onSelectProduct={this.props.onSelectProduct}
        onDeleteProduct={this.props.onDeleteProduct}
      />
    ));
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Product Description</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>{productNodes}</tbody>
        </table>
      </div>
    );
  },
});

var Product = React.createClass({
  handleClick: function () {
    this.props.onSelectProduct(
      this.props.product.ProductID,
      this.props.product
    );
  },
  handleDeleteClick: function () {
    this.props.onDeleteProduct(this.props.product.ProductID);
  },
  render: function () {
    const { ProductID, ProductName, ProductDesc } = this.props.product;
    return (
      <tr>
        <td>{ProductID}</td>
        <td>{ProductName}</td>
        <td>{ProductDesc}</td>
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

var ProductEditForm = React.createClass({
  getInitialState: function () {
    const { ProductName, ProductDesc, ProductPrice, ProductSize } =
      this.props.productDetails;
    return {
      productNameEA: ProductName || "",
      productDescEA: ProductDesc || "",
      productPriceEA: ProductPrice || "",
      productSizeEA: ProductSize || "",
    };
  },
  componentDidUpdate: function (prevProps) {
    if (this.props.productId !== prevProps.productId) {
      const { ProductName, ProductDesc, ProductPrice, ProductSize } =
        this.props.productDetails;
      this.setState({
        productNameEA: ProductName || "",
        productDescEA: ProductDesc || "",
        productPriceEA: ProductPrice || "",
        productSizeEA: ProductSize || "",
      });
    }
  },
  handleSubmit: function (event) {
    event.preventDefault();
    const productData = {
      productId: this.props.productId,
      productName: this.state.productNameEA,
      productDesc: this.state.productDescEA,
      productPrice: this.state.productPriceEA,
      productSize: this.state.productSizeEA,
    };

    fetch("/updateproduct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("Product updated successfully!");
      })
      .catch((error) => console.error("Error updating product:", error));
  },
  handleChange: function (event) {
    var stateUpdate = {};
    stateUpdate[event.target.name] = event.target.value;
    this.setState(stateUpdate);
  },
  render: function () {
    return (
      <div>
        <h2>Edit Product ID: {this.props.productId}</h2>
        <form onSubmit={this.handleSubmit}>
          <label>
            Product Name:
            <input
              type="text"
              name="productNameEA"
              value={this.state.productNameEA}
              onChange={this.handleChange}
            />
          </label>
          <br />
          <label>
            Product Description:
            <input
              type="desc"
              name="productDescEA"
              value={this.state.productDescEA}
              onChange={this.handleChange}
            />
          </label>
          <br />
          <label>
            Product Price:
            <input
              type="text"
              name="productPriceEA"
              value={this.state.productPriceEA}
              onChange={this.handleChange}
            />
          </label>
          <br />
          <label>
            Product Size:
            <input
              type="text"
              name="productSizeEA"
              value={this.state.productSizeEA}
              onChange={this.handleChange}
            />
          </label>
          <br />
          <button type="submit">Submit Product Update</button>
        </form>
      </div>
    );
  },
});

var ProductSearchForm = React.createClass({
  getInitialState: function () {
    return {
      productNameEA: "",
      productDescEA: "",
      productPriceEA: "",
      productSizeEA: "",
    };
  },
  handleSubmit: function (e) {
    e.preventDefault();
    var searchQuery = {
      name: this.state.productNameEA.trim(),
      desc: this.state.productDescEA.trim(),
      price: this.state.productPriceEA.trim(),
      size: this.state.productSizeEA.trim(),
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
        <h3>Use the Form below to search the product list of items to edit.</h3>
        <input
          type="text"
          name="productNameEA"
          value={this.state.productNameEA}
          onChange={this.handleChange}
          placeholder="Product Name"
        />
        <input
          type="text"
          name="productDescEA"
          value={this.state.productDescEA}
          onChange={this.handleChange}
          placeholder="Product Description"
        />
        <input
          type="text"
          name="productPriceEA"
          value={this.state.productPriceEA}
          onChange={this.handleChange}
          placeholder="Product Price"
        />
        <input
          type="text"
          name="productSizeEA"
          value={this.state.productSizeEA}
          onChange={this.handleChange}
          placeholder="Product Size"
        />
        <input type="submit" value="Search Products" />
      </form>
    );
  },
});

ReactDOM.render(<ProductEditBox />, document.getElementById("content"));