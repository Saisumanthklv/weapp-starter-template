// custom-tab-bar/index.js
Component({
  data: {
    active: 0,
    list: [
      {
        pagePath: "/src/pages/home/index",
        iconPath: "wap-home-o",
        selectedIconPath: "wap-home",
        text: "首页"
      },
      {
        pagePath: "/src/pages/profile/index", 
        iconPath: "contact",
        selectedIconPath: "contact",
        text: "我的"
      }
    ]
  },
  attached() {
    this.setData({
      active: this.getTabBarIndex()
    });
  },
  methods: {
    onChange(event) {
      this.setData({ active: event.detail });
      wx.switchTab({
        url: this.data.list[event.detail].pagePath
      });
    },
    
    getTabBarIndex() {
      const page = getCurrentPages().pop();
      const route = page ? page.route : '';
      return this.data.list.findIndex(item => item.pagePath === `/${route}`);
    },
    
    init() {
      const page = getCurrentPages().pop();
      const route = page ? page.route : '';
      const active = this.data.list.findIndex(item => item.pagePath === `/${route}`);
      if (active >= 0) {
        this.setData({ active });
      }
    }
  }
});
