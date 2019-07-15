module.exports = {
  ApiResponse: ({ state, data, message }) => {
    return {
      state: state,
      data: data || {},
      message: message || 'request success'
    }
  }
}
