var OrderSearchBox = React.createClass({
  getInitialState: function () {
    return {
      dataEA: [],
      userDataEA: [],
      productDataEA: [],
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

  loadOrdersFromServer: function (searchQueryEA) {
    $.ajax({
      url: "/searchorders",
      data: searchQueryEA,
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ dataEA: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/searchorders", status, err.toString());
      }.bind(this),
    });
  },

  loadUserOptions: function () {
    $.ajax({
      url: "/getplayers",
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ userDataEA: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/getplayers", status, err.toString());
      }.bind(this),
    });
  },

  loadProductOptions: function () {
    $.ajax({
      url: "/searchproducts",
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ productDataEA: data });
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
          <OrderSearchForm
            onOrderSearch={this.loadOrdersFromServer}
            userData={this.state.userDataEA}
            productData={this.state.productDataEA}
          />
          <br />
          {this.state.dataEA.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Product</th>
                  <th>Date</th>
                  <th>Price</th>
                </tr>
              </thead>
              <OrderList data={this.state.dataEA} />
            </table>
          )}
        </div>
      );
    }
  },
});

var OrderSearchForm = React.createClass({
  getInitialState: function () {
    return {
      selectedUserIdEA: "",
      selectedProductIdEA: "",
      selectedDateEA: "",
      selectedPriceEA: "",
    };
  },

  handleUserChange: function (e) {
    this.setState({ selectedUserIdEA: e.target.value });
  },

  handleProductChange: function (e) {
    this.setState({ selectedProductIdEA: e.target.value });
  },

  handleDateChange: function (e) {
    this.setState({ selectedDateEA: e.target.value });
  },

  handlePriceChange: function (e) {
    this.setState({ selectedPriceEA: e.target.value });
  },

  handleSubmit: function (e) {
    e.preventDefault();
    var searchQueryEA = {
      userId: this.state.selectedUserIdEA,
      productId: this.state.selectedProductIdEA,
      date: this.state.selectedDateEA,
      price: this.state.selectedPriceEA,
    };
    this.props.onOrderSearch(searchQueryEA);
  },

  render: function () {
    return (
      <form className="orderSearchForm" onSubmit={this.handleSubmit}>
        <h3>
          This form is for searching active orders, this refers to orders
          recently placed, and seen as "placed". For searching of orders that
          were approved, view the "Search Purchases" page; as the current page
          you are visiting, is for orders that are not yet purchases.
        </h3>
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
              <th>Select Date</th>
              <td>
                <input type="date" onChange={this.handleDateChange} />
              </td>
            </tr>
            <tr>
              <th>Price</th>
              <td>
                <input
                  type="number"
                  step="0.01"
                  onChange={this.handlePriceChange}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <input type="submit" value="Search Orders" />
      </form>
    );
  },
});

var OrderList = React.createClass({
  render: function () {
    var orderNodesEA = this.props.data.map(function (order) {
      return (
        <Order
          key={order.OrdersID}
          playerName={order.PlayerFirstName + " " + order.PlayerLastName}
          productName={order.ProductName}
          orderDate={order.OrdersDate}
          orderPrice={order.OrderTotalPrice}
        />
      );
    });
    return <tbody>{orderNodesEA}</tbody>;
  },
});

var Order = React.createClass({
  render: function () {
    // Format the date string
    var formattedDate = new Date(this.props.orderDate).toLocaleDateString();

    return (
      <tr>
        <td>{this.props.playerName}</td>
        <td>{this.props.productName}</td>
        <td>{formattedDate}</td>
        <td>{this.props.orderPrice}</td>
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
    var options = this.props.data.map(function (itemEA) {
      return (
        <option key={itemEA.PlayerID} value={itemEA.PlayerID}>
          {itemEA.PlayerFirstName + " " + itemEA.PlayerLastName}
        </option>
      );
    });
    return (
      <select onChange={this.handleChange}>
        <option value="">Select User</option>
        {options}
      </select>
    );
  },
});

var SelectList2 = React.createClass({
  handleChange: function (event) {
    if (this.props.onProductChange) {
      this.props.onProductChange(event);
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
      <select onChange={this.handleChange}>
        <option value="">Select Product</option>
        {options}
      </select>
    );
  },
});

ReactDOM.render(<OrderSearchBox />, document.getElementById("content"));
