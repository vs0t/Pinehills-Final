var OrderEditBox = React.createClass({
  getInitialState: function () {
    return {
      ordersEA: [],
      selectedOrderIdEA: null,
      selectedOrderDetailsEA: null,
      dataEA: [],
      viewthepageEA: 0,
      userDataEA: [],
      productDataEA: [],
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
    this.fetchOrders();
    this.loadUserOptions();
    this.loadProductOptions();
  },
  fetchOrders: function (searchQueryEA) {
    $.ajax({
      url: "/searchorders",
      data: searchQueryEA,
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ ordersEA: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("Error fetching orders:", err.toString());
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
  selectOrder: function (orderId, orderDetails) {
    this.setState({
      selectedOrderIdEA: orderId,
      selectedOrderDetailsEA: orderDetails,
    });
  },
  deleteOrder: function (orderId) {
    fetch(`/deleteorder/${orderId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("Order deleted successfully!");
        this.fetchOrders();
      })
      .catch((error) => console.error("Error deleting order:", error));
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
          {/* <h1>Order Edit</h1> */}
          <h3>
            This form is for editing Placed orders, to edit confirmed orders
            view the Edit Purchases Site
          </h3>
          <OrderSearchForm
            onOrderSearch={this.fetchOrders}
            userData={this.state.userDataEA}
            productData={this.state.productDataEA}
          />
          <OrderList
            orders={this.state.ordersEA}
            onSelectOrder={this.selectOrder}
            onDeleteOrder={this.deleteOrder}
          />
          {this.state.selectedOrderIdEA && (
            <OrderEditForm
              orderId={this.state.selectedOrderIdEA}
              orderDetails={this.state.selectedOrderDetailsEA}
              refreshOrders={this.fetchOrders}
            />
          )}
        </div>
      );
    }
  },
});

var OrderList = React.createClass({
  render: function () {
    var orderNodesEA = this.props.orders.map((order) => (
      <Order
        key={order.OrdersID}
        order={order}
        onSelectOrder={this.props.onSelectOrder}
        onDeleteOrder={this.props.onDeleteOrder}
      />
    ));
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Order Date</th>
              <th>Player Name</th>
              <th>Product Name</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>{orderNodesEA}</tbody>
        </table>
      </div>
    );
  },
});

var Order = React.createClass({
  handleClick: function () {
    this.props.onSelectOrder(this.props.order.OrdersID, this.props.order);
  },
  handleDeleteClick: function () {
    this.props.onDeleteOrder(this.props.order.OrdersID);
  },
  render: function () {
    const {
      OrdersID,
      OrdersDate,
      PlayerFirstName,
      PlayerLastName,
      ProductName,
    } = this.props.order;
    const orderDate = new Date(OrdersDate);
    const formattedDate = orderDate.toISOString().split("T")[0];
    const formattedTime = orderDate.toTimeString().split(" ")[0];
    return (
      <tr>
        <td>{OrdersID}</td>
        <td>{formattedDate}</td>
        <td>
          {PlayerFirstName} {PlayerLastName}
        </td>
        <td>{ProductName}</td>
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

var OrderEditForm = React.createClass({
  getInitialState: function () {
    const { OrdersDate, OrdersTime, OrderTotalPrice, OrderStatus } =
      this.props.orderDetails;
    const orderDateTime = new Date(OrdersDate);
    const formattedDate = orderDateTime.toISOString().split("T")[0];
    const formattedTime = OrdersTime.substring(0, 8);
    return {
      orderDateEA: formattedDate || "",
      orderTimeEA: formattedTime || "",
      pricePaidEA: OrderTotalPrice || "",
      orderStatusEA: OrderStatus || 0,
    };
  },
  componentDidUpdate: function (prevProps) {
    if (this.props.orderId !== prevProps.orderId) {
      const { OrdersDate, OrdersTime, OrderTotalPrice, OrderStatus } =
        this.props.orderDetails;
      const orderDateTime = new Date(OrdersDate);
      const formattedDate = orderDateTime.toISOString().split("T")[0];
      const formattedTime = OrdersTime.substring(0, 8);
      this.setState({
        orderDateEA: formattedDate || "",
        orderTimeEA: formattedTime || "",
        pricePaidEA: OrderTotalPrice || "",
        orderStatusEA: OrderStatus || 0,
      });
    }
  },
  handleSubmit: function (event) {
    event.preventDefault();
    const orderDataEA = {
      orderId: this.props.orderId,
      orderDate: this.state.orderDateEA,
      orderTime: this.state.orderTimeEA,
      pricePaid: this.state.pricePaidEA,
      orderStatus: this.state.orderStatusEA,
    };

    fetch("/updateorder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderDataEA),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("Order updated successfully!");
        this.props.refreshOrders();
      })
      .catch((error) => console.error("Error updating order:", error));
  },
  handleChange: function (event) {
    var stateUpdateEA = {};
    stateUpdateEA[event.target.name] = event.target.value;
    this.setState(stateUpdateEA);
  },
  render: function () {
    return (
      <div>
        <h2>Edit Order ID: {this.props.orderId}</h2>
        <form onSubmit={this.handleSubmit}>
          <label>
            Order Date:
            <input
              type="date"
              name="orderDateEA"
              value={this.state.orderDateEA}
              onChange={this.handleChange}
            />
          </label>
          <br />
          <label>
            Order Time:
            <input
              type="time"
              name="orderTimeEA"
              value={this.state.orderTimeEA}
              onChange={this.handleChange}
            />
          </label>
          <br />
          <label>
            Price Paid:
            <input
              type="text"
              name="pricePaidEA"
              value={this.state.pricePaidEA}
              onChange={this.handleChange}
            />
          </label>
          <br />
          <label>
            Order Status:
            <select
              name="orderStatusEA"
              value={this.state.orderStatusEA}
              onChange={this.handleChange}
            >
              <option value={0}>Placed</option>
              <option value={1}>Confirmed</option>
            </select>
          </label>
          <br />
          <button type="submit">Submit Order Update</button>
        </form>
      </div>
    );
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
          Search Order(s) to edit
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

var SelectList = React.createClass({
  handleChange: function (event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  },
  render: function () {
    var optionsEA = this.props.data.map(function (itemEA) {
      return (
        <option key={itemEA.PlayerID} value={itemEA.PlayerID}>
          {itemEA.PlayerFirstName + " " + itemEA.PlayerLastName}
        </option>
      );
    });
    return (
      <select onChange={this.handleChange}>
        <option value="">Select User</option>
        {optionsEA}
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
    var optionsEA = this.props.data.map(function (itemEA) {
      return (
        <option key={itemEA.ProductID} value={itemEA.ProductID}>
          {itemEA.ProductName}
        </option>
      );
    });
    return (
      <select onChange={this.handleChange}>
        <option value="">Select Product</option>
        {optionsEA}
      </select>
    );
  },
});

ReactDOM.render(<OrderEditBox />, document.getElementById("content"));