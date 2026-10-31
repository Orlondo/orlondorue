declare global {
  interface Window {
    dataLayer: any[]
  }
}

export default () => {
  const pushDataLayer = (data: any) => {
    console.log('window?.dataLayer', window?.dataLayer)
    window?.dataLayer.push(data)
  }

  const clickHandler = () => {
    pushDataLayer({ event: 'button_click' })
  }

  return (
    <>
      <div>TagManager</div>
      <button onClick={clickHandler}>Submit</button>
    </>
  )
}
