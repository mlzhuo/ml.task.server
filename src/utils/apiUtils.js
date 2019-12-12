const ApiResponse = ({ state, data, message }) => {
  return {
    state: state,
    data: data || null,
    message: message || 'success'
  }
}

const responseData = ({ res, result, data, message }) => {
  if (result) {
    res.json(
      ApiResponse({
        state: true,
        data,
        message
      })
    )
  } else {
    res.json(
      ApiResponse({
        state: false,
        message: message || 'failed'
      })
    )
  }
}

module.exports = { responseData }
