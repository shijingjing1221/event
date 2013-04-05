$(function() {
  App = window.App || {};
  App.Model = window.App.Model || {};
  App.Collection = window.App.Collection || {};
  App.View = window.App.View || {};

  /*
   * Models
   */
  App.Model.Session = Backbone.Model.extend({
    urlRoot: '/api/sessions',
    auth: false // default
  });

  App.Model.Order = Backbone.Model.extend({
    idAttribute: "_id",
    urlRoot: '/api/orders'
  });

  App.Model.Food = Backbone.Model.extend({
    idAttribute: "_id",
    urlRoot: '/api/food'
  });

  App.Model.User = Backbone.Model.extend({
     idAttribute: "_id",
     urlRoot: '/api/users'
  });

  App.Model.ShoppingCartItem = Backbone.Model.extend({
    increase: function(num){
      this.set('count', this.get('count') + num);
    }
  });

  App.Model.Shop = Backbone.Model.extend({
     idAttribute: "_id",
     urlRoot: '/api/shops'
  });

  //initialize session
  var session = jQuery.parseJSON($('#json-session').html());
  if(session.auth) session.id = 'me';
  else session.auth = false;
  App.session = new App.Model.Session(session);

  /**
   * Collection
   */
  App.Collection.OrderCollection = Backbone.Collection.extend({
    model: App.Model.Order,
    url: '/api/orders',

    getTotalCost: function() {
      var total = 0;
      this.each(function(order){
        if(order.get('status') != 'cancelled'){
          total += order.get('totalCost');
        }
      });

      return total;
    },

    getAvailabelOrdersNum: function() {
      var num = 0;
      this.each(function(order){
        if(order.get('status') != 'cancelled'){
          num++;
        }
      });

      return num;
    },

    calcMonthReportData: function() {
      var r = {};
      var reports = r.userReports = {};
      var shops = r.shops = {};
      r.total = 0;
      //TODO: use user id as key
      this.each(function(order) {
        if(!reports[order.get('userId')]) {
          var userReport = {};
          userReport.userName = order.get('userName');
          userReport.userId = order.get('userId');
          userReport.unpaid = 0;
          userReport.orders = [];
          reports[order.get('userId')] = userReport;
        }

        reports[order.get('userId')].orders.push(order);
        
        if(order.get('status') == 'completed'){
          reports[order.get('userId')].unpaid += order.get('totalCost');
          r.total += order.get('totalCost');
        }

        if(!shops[order.get('shopName')]) {
          var shop = {};
          shop.name = order.get('shopName');
          shop.orders = [];
          shop.total = 0;
          shops[order.get('shopName')] = shop;
        }

        shops[order.get('shopName')].orders.push(order);
        if(order.get('status') == 'completed'){
          shops[order.get('shopName')].total += order.get('totalCost');
        }
      });

      return r;
    },

    calcDayReportData: function() {
      var r = {};
      var reports = r.reports = {};

      this.each(function(order) {
        var now = new Date();
        var noon = new Date();
        noon.setHours(12,10,0,0);
        var shipDate = new Date(order.get('shipDate'));

        if(order.get('status') != 'cancelled' && ((now>=noon && shipDate>=noon) || (now<noon && shipDate<noon)) ){
          var lineItems = order.get('lineItems');

          for(var i in lineItems) {
            var lineItem = lineItems[i];

            if(!reports[lineItem.name]) {
              var orderDayCount = {};
              orderDayCount.foodName = lineItem.name;
              orderDayCount.foodPrice = lineItem.unitCost;
              orderDayCount.foodDiscount = lineItem.discount;
              orderDayCount.foodShopName = order.get('shopName');
              orderDayCount.amount = 0;
              orderDayCount.foodImageUrl = lineItem.imageUrl;
              orderDayCount.orders = [];
              reports[lineItem.name] = orderDayCount;
            }

            reports[lineItem.name].amount += lineItem.count;
            reports[lineItem.name].orders.push(order);
          }
        }
      });

      return r;
    },

    getPendingOrdersLength: function() {
      var length = 0;
      this.each(function(order){
        if(order.get('status') == 'pending') length++;
      });

      return length;
    },

    getUserNumber: function() {
      var users = {};
      var length = 0;
      this.each(function(order){
        var userId = order.get('userId');
        if(!users[userId]) {
          users[userId] = true;
          length ++;
        }
      });

      return length;
    }
  });
  
  App.Collection.FoodCollection = Backbone.Collection.extend({
    model: App.Model.Food,
    url: '/api/food',

    sortByShop: function() {
      var sorted = this.sortBy(function(food) {
        return food.get('shopName') + food.get('title');
      });

      return sorted;
    },

    filterByShelfStatus: function(onSell){
      var list = new App.Collection.FoodCollection();

      this.each(function(food){
        if(food.get('onSell') == onSell)
          list.add(food);
      });

      return list;
    }
  });

  App.Collection.UserCollection = Backbone.Collection.extend({
    model: App.Model.User,
    url: '/api/users'
  });

  App.Collection.ShoppingCartItemCollection = Backbone.Collection.extend({
    model: App.Model.ShoppingCartItem,

    initialize: function(){
      this.fetch();
    },

    save: function(successCallback, errorCallback) {
      // delete cookie first
      var lines = $.cookie('lines');
      for(var i = 1; i <= lines; i++){
        $.cookie('item_name_' + i, null);
        $.cookie('item_price_' + i, null);
        $.cookie('item_discount_' + i, null);
        $.cookie('item_count_' + i, null);
        $.cookie('item_imageurl_' + i, null);
        $.cookie('item_shopName_' + i, null);
        $.cookie('item_shopId_' + i, null);
        i++;
      }

      // save into cookie
      var date = new Date();
      date.setTime(date.getTime() + (3 * 24 * 60 * 60 * 1000));

      $.cookie('lines', this.length, {expires: date});
      var i = 1;
      this.each(function(item){
        $.cookie('item_name_' + i, item.get('id'), {expires: date});
        $.cookie('item_price_' + i, item.get('price'), {expires: date});
        $.cookie('item_discount_' + i, item.get('discount'), {expires: date});
        $.cookie('item_count_' + i, item.get('count'), {expires: date});
        $.cookie('item_imageurl_' + i, item.get('imageUrl'), {expires: date});
        $.cookie('item_shopName_' + i, item.get('shopName'), {expires: date});
        $.cookie('item_shopId_' + i, item.get('shopId'), {expires: date});
        i++;
      });
    },
    
    fetch: function() {
      var items = [];
      var lines = $.cookie('lines');
      if(!lines) lines = 0;

      for(var i = 1; i <= lines; i++){
        var item = new App.Model.ShoppingCartItem({
          id : $.cookie('item_name_' + i),
          price : new Number($.cookie('item_price_' + i)),
          discount : new Number($.cookie('item_discount_' + i)),
          count : new Number($.cookie('item_count_' + i)),
          imageUrl : $.cookie('item_imageurl_' + i),
          shopName : $.cookie('item_shopName_' + i),
          shopId : $.cookie('item_shopId_' + i)
        });
        
        items.push(item);
      }

      this.reset(items);
    },

    addItem: function(item) {
      var oldItem = this.get(item.get('id'));
      if(oldItem){
        oldItem.increase(item.get('count'));
      }else{
        this.add(item);
      }

      this.save();
    },

    getTotalCost: function() {
      var totalCost = 0;
      this.each(function(item) {
        totalCost += item.get('count') * item.get('price') * item.get('discount');
      });

      return totalCost;
    },

    getTotalCount: function() {
      var totalCount = 0;
      this.each(function(item) {
        totalCount += new Number(item.get('count'));
      });

      return totalCount;
    },

    generateOrders: function() {
      var shipDate = new Date();
      var h = new Number(shipDate.getHours());
      if(h > 10) shipDate.setDate(shipDate.getDate()+1);
      shipDate.setHours(12,0,0,0);

      var orders = {};
      this.each(function(item){
        var shopName = item.get('shopName');

        if(!orders[shopName]){
          orders[shopName] = {};
          orders[shopName].shopName = shopName;
          orders[shopName].shopId = item.get('shopId');
          orders[shopName].lineItems = [];
          orders[shopName].totalCost = 0;
          orders[shopName].shipDate = shipDate;
        }

        var lineItem = new Object();
        lineItem.name = item.get('id');
        lineItem.unitCost = item.get('price');
        lineItem.discount = item.get('discount');
        lineItem.count = item.get('count');
        lineItem.imageUrl = item.get('imageUrl');

        orders[shopName].lineItems.push(lineItem);
        orders[shopName].totalCost += lineItem.unitCost * lineItem.discount * lineItem.count;
      });

      var orderCollection = new App.Collection.OrderCollection();
      $.each(orders, function(index, order){
        orderCollection.add(new App.Model.Order(order));
      });

      return orderCollection;
    },

    empty: function() {
      this.reset();
      this.save();
    }
  });

  /**
   * Common views
   */
  App.View.AlertView = Backbone.View.extend({
    initialize: function() {
      this.template = _.template($(this.options.templateId).html());
    },

    render: function() {
      $(this.el).html(this.template({message: this.model}));
      return this;
    }
  });
});

// Utils
// $.ajaxSetup({cache:false});
$.fn.serializeObject = function() {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function() {
    if(o[this.name] !== undefined) {
      if(!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    } else {
      o[this.name] = this.value || '';
    }
  });
  return o;
}

function formatDate(date, friendly) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();

  if(friendly) {
    var now = new Date();
    var mseconds = -(date.getTime() - now.getTime());
    var time_std = [1000, 60 * 1000, 60 * 60 * 1000, 24 * 60 * 60 * 1000];
    if(mseconds < time_std[3]) {
      if(mseconds > 0 && mseconds < time_std[1]) {
        return Math.floor(mseconds / time_std[0]).toString() + ' 秒前';
      }
      if(mseconds > time_std[1] && mseconds < time_std[2]) {
        return Math.floor(mseconds / time_std[1]).toString() + ' 分钟前';
      }
      if(mseconds > time_std[2]) {
        return Math.floor(mseconds / time_std[2]).toString() + ' 小时前';
      }
    }
  }

  month = ((month < 10) ? '0' : '') + month;
  day = ((day < 10) ? '0' : '') + day;
  hour = ((hour < 10) ? '0' : '') + hour;
  minute = ((minute < 10) ? '0' : '') + minute;
  second = ((second < 10) ? '0' : '') + second;

  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
}

function formatNumber(number, decimals, dec_point, thousands_sep) {

  number = (number + '').replace(/[^0-9+-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + Math.round(n * k) / k;
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
  if(s[0].length > 3) {
    s[0] = s[0].replace(/B(?=(?:d{3})+(?!d))/g, sep);
  }
  if((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }
  return s.join(dec);
}

function roleCheck(roleName, roles) {
  for(var i in roles) {
    if(roleName == roles[i]) return true;
  }

  return false;
}

function validateEmail(elementValue){  
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;  
    return emailPattern.test(elementValue);  
}  
