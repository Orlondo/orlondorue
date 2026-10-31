export default () => {
  const pushDataLayer = (data: any) => {
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
