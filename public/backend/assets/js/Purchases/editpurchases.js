var PurchaseEditBox = React.createClass({
  getInitialState: function () {
    return {
      purchasesEA: [],
      selectedPurchaseIdEA: null,
      selectedPurchaseDetailsEA: null,
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
    this.fetchPurchases();
    this.loadUserOptions();
    this.loadProductOptions();
  },
  fetchPurchases: function (searchQueryEA) {
    $.ajax({
      url: "/searchpurchases",
      data: searchQueryEA,
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ purchasesEA: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("Error fetching purchases:", err.toString());
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
  selectPurchase: function (purchaseId, purchaseDetails) {
    this.setState({
      selectedPurchaseIdEA: purchaseId,
      selectedPurchaseDetailsEA: purchaseDetails,
    });
  },
  deletePurchase: function (purchaseId) {
    fetch(`/deletepurchase/${purchaseId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("Purchase deleted successfully!");
        this.fetchPurchases();
      })
      .catch((error) => console.error("Error deleting purchase:", error));
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
          <h1>Purchase Edit</h1>
          <PurchaseSearchForm
            onPurchaseSearch={this.fetchPurchases}
            userData={this.state.userDataEA}
            productData={this.state.productDataEA}
          />
          <PurchaseList
            purchases={this.state.purchasesEA}
            onSelectPurchase={this.selectPurchase}
            onDeletePurchase={this.deletePurchase}
          />
          {this.state.selectedPurchaseIdEA && (
            <PurchaseEditForm
              purchaseId={this.state.selectedPurchaseIdEA}
              purchaseDetails={this.state.selectedPurchaseDetailsEA}
              refreshPurchases={this.fetchPurchases}
            />
          )}
        </div>
      );
    }
  },
});

var PurchaseList = React.createClass({
  render: function () {
    var purchaseNodesEA = this.props.purchases.map((purchase) => (
      <Purchase
        key={purchase.OrdersID}
        purchase={purchase}
        onSelectPurchase={this.props.onSelectPurchase}
        onDeletePurchase={this.props.onDeletePurchase}
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
              <th>Price Paid</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>{purchaseNodesEA}</tbody>
        </table>
      </div>
    );
  },
});

var Purchase = React.createClass({
  handleClick: function () {
    this.props.onSelectPurchase(
      this.props.purchase.OrdersID,
      this.props.purchase
    );
  },
  handleDeleteClick: function () {
    this.props.onDeletePurchase(this.props.purchase.OrdersID);
  },
  render: function () {
    const {
      OrdersID,
      OrdersDate,
      PlayerFirstName,
      PlayerLastName,
      ProductName,
      OrderTotalPrice,
    } = this.props.purchase;
    const orderDate = new Date(OrdersDate);
    const formattedDate = orderDate.toISOString().split("T")[0];
    return (
      <tr>
        <td>{OrdersID}</td>
        <td>{formattedDate}</td>
        <td>
          {PlayerFirstName} {PlayerLastName}
        </td>
        <td>{ProductName}</td>
        <td>${OrderTotalPrice}</td>
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

var PurchaseEditForm = React.createClass({
  getInitialState: function () {
    const { OrderTotalPrice, OrderStatus } = this.props.purchaseDetails;
    return {
      pricePaidEA: OrderTotalPrice || "",
      orderStatusEA: OrderStatus || 1,
    };
  },
  componentDidUpdate: function (prevProps) {
    if (this.props.purchaseId !== prevProps.purchaseId) {
      const { OrderTotalPrice, OrderStatus } = this.props.purchaseDetails;
      this.setState({
        pricePaidEA: OrderTotalPrice || "",
        orderStatusEA: OrderStatus || 1,
      });
    }
  },
  handleSubmit: function (event) {
    event.preventDefault();
    const purchaseDataEA = {
      purchaseId: this.props.purchaseId,
      pricePaid: this.state.pricePaidEA,
      orderStatus: this.state.orderStatusEA,
    };

    fetch("/updatepurchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(purchaseDataEA),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("Purchase updated successfully!");
        this.props.refreshPurchases();
      })
      .catch((error) => console.error("Error updating purchase:", error));
  },
  handleChange: function (event) {
    var stateUpdateEA = {};
    stateUpdateEA[event.target.name] = event.target.value;
    this.setState(stateUpdateEA);
  },
  render: function () {
    return (
      <div>
        <h2>Edit Purchase ID: {this.props.purchaseId}</h2>
        <form onSubmit={this.handleSubmit}>
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
          <button type="submit">Submit Purchase Update</button>
        </form>
      </div>
    );
  },
});

var PurchaseSearchForm = React.createClass({
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
    this.props.onPurchaseSearch(searchQueryEA);
  },
  render: function () {
    return (
      <form className="purchaseSearchForm" onSubmit={this.handleSubmit}>
        <h3>
          This form is for searching approved purchases. It displays the user's
          delivery address and other relevant information.
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
        <input type="submit" value="Search Purchases" />
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

ReactDOM.render(<PurchaseEditBox />, document.getElementById("content"));