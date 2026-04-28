Component({
  properties: {
    list: {
      type: Array,
      value: [],
    },
  },

  methods: {
    onItemClick(e) {
      const { index } = e.currentTarget.dataset;
      this.triggerEvent('click', { index, item: this.properties.list[index] });
    },
  },
});
