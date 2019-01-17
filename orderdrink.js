$(function(){
  $.event.special.tap.emitTapOnTaphold = false;
  $.event.special.tap.tapholdThreshold = 500;
  
  var Drink = Backbone.Model.extend({
    defaults: function() {
      return {
        name: "empty",
        num: 0
      };
    },
    plus: function() {
      var cur = this.get("num")
      this.save({num: cur+1});
    },
    minus: function() {
   	  var cur = this.get("num")
      this.save({num: cur <= 0 ? 0 : cur-1})
    },
    rename: function(name) {
      this.save({name:name})
    }
  });

  var Orders = Backbone.Collection.extend({
  	model: Drink,
  	localStorage: new Backbone.LocalStorage("drink-orders"),
  	orderList: function() {
      return this.filter(function(drink) {
      	return drink.get('num') > 0;
      });
    }
  });

  var orders = new Orders(drinks);

  var DrinkView = Backbone.View.extend({
  	template: _.template($('#drink-template').html()),
	  events: {
      "click .plus" : "order",
      "click .minus" : "minus",
      "taphold .plus" : "rename"
    },
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },
    order: function(e) {
      this.model.plus();
    },
    minus:function(e) {
    	this.model.minus();
    },
    rename:function(e){
      var name = prompt("Enter the name of your order",this.model.get("name"))
      if (name != null) {
        this.model.rename(name)
      }
    },
	  render: function() {
      this.$el.html(this.template(this.model.attributes));
      return this;
    }
  });

  var OrderView = Backbone.View.extend({
  	template: _.template($('#order-template').html()),
  	render: function() {
      this.$el.html(this.template(this.model.attributes));
      return this;
    }
  });

  var AppView = Backbone.View.extend({
  	el: $("#order-drink-app"),
    events: {
      "click .toggle-view" : "toggleView"
    },
    toggleView: function() {
      var dl = this.$('#drink-list');
      var ol = this.$('#order-list');
      if (dl.hasClass('hidden')) {
        dl.removeClass('hidden');
      } else {
        dl.addClass('hidden');
      }

      if (ol.hasClass('hidden')) {
        ol.removeClass('hidden');
      } else {
        ol.addClass('hidden');
      }
    },
    initialize: function() {
      this.listenTo(orders, 'change', this.renderOrders);
    	this.render();
    },
    renderDrink: function(drink) {
      var view = new DrinkView({model: drink});
      this.$("#drink-list").append(view.render().el);
    },
    renderOrder: function(drink) {
      var view = new OrderView({model: drink});
      this.$("#order-list").append(view.render().el);
    },
    renderOrders: function() {
      var toggleBtn = this.$('.toggle-view');
      this.$('#order-list').empty()
      var orderList = orders.orderList()
      if (orderList.length) {
        toggleBtn.removeClass('hidden');
        _.each(orderList, this.renderOrder, this);
      } else {
        toggleBtn.addClass('hidden');
      }
    },
    render: function() {
    	orders.each(this.renderDrink, this);
    	this.renderOrders();
    }
  });

  var app = new AppView;
});
