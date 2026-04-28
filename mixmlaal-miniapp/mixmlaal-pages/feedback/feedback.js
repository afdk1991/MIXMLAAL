const app = getApp();
const { showToast } = require('../../utils/util');

Page({
  data: {
    feedbackType: '',
    feedbackTypes: [
      { id: 'bug', name: '功能异常' },
      { id: 'suggestion', name: '建议反馈' },
      { id: 'complaint', name: '投诉' },
      { id: 'other', name: '其他' },
    ],
    content: '',
    contact: '',
    images: [],
    maxImages: 3,
    isSubmitting: false,
  },

  onTypeChange(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({ feedbackType: id });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  onContactInput(e) {
    this.setData({ contact: e.detail.value });
  },

  chooseImage() {
    const { images, maxImages } = this.data;

    if (images.length >= maxImages) {
      showToast('最多上传3张图片');
      return;
    }

    wx.chooseImage({
      count: maxImages - images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        this.setData({
          images: [...images, ...res.tempFilePaths],
        });
      },
    });
  },

  removeImage(e) {
    const { index } = e.currentTarget.dataset;
    const { images } = this.data;
    images.splice(index, 1);
    this.setData({ images });
  },

  async submit() {
    const { feedbackType, content, contact, images, isSubmitting } = this.data;

    if (isSubmitting) { return; }

    if (!feedbackType) {
      showToast('请选择反馈类型');
      return;
    }

    if (!content.trim()) {
      showToast('请输入反馈内容');
      return;
    }

    if (content.length < 10) {
      showToast('反馈内容至少10个字');
      return;
    }

    this.setData({ isSubmitting: true });

    try {
      let imageUrls = [];
      if (images.length > 0) {
        imageUrls = await this.uploadImages(images);
      }

      await app.request({
        url: '/help/feedback',
        method: 'POST',
        data: {
          type: feedbackType,
          content,
          contact,
          images: imageUrls,
        },
      });

      showToast('提交成功');

      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
    } catch (error) {
      console.error('提交反馈失败:', error);
    } finally {
      this.setData({ isSubmitting: false });
    }
  },

  async uploadImages(images) {
    const urls = [];
    for (const image of images) {
      try {
        const res = await wx.uploadFile({
          url: `${app.globalData.baseUrl}/upload`,
          filePath: image,
          name: 'file',
        });
        const data = JSON.parse(res.data);
        urls.push(data.url);
      } catch (error) {
        console.error('上传图片失败:', error);
      }
    }
    return urls;
  },
});
