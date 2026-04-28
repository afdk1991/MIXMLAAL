Component({
  properties: {
    product: {
      type: Object,
      value: {},
    },
  },

  methods: {
    onProductClick() {
      this.triggerEvent('click', this.properties.product);
    },

    onAddCart() {
      this.triggerEvent('addcart', this.properties.product);
    },
  },
});
