import { html, useState, render, useEffect, useCallback } from './runtime'

function CountButton({ name, onClick, count }) {
  useEffect(() => {
    console.log(`${name} rendered+`)
    return () => console.log(`${name} rendered-`)
  }, [])
  return html`<button onClick=${onClick}>${name} = ${count}</button>`
}

function DualCounter() {
  const [count1, setCount1] = useState(1)
  const increment1 = useCallback(() => setCount1(c => c + 1), [])

  const [count2, setCount2] = useState(2)
  const increment2 = useCallback(() => setCount2(c => c + 1), [])

  useEffect(() => {
    console.log(`DualCounter rendered+`)
    const d = document.querySelector('#hide')
    console.log(d)
    return () => console.log(`DualCounter rendered-`)
  }, [increment1, increment2])

  return (
    html`<div>
      <${CountButton} name="Button 1" count=${count1} onClick=${increment1} />
      <${CountButton} name="Button 2" count=${count2} onClick=${increment2} />
    </div>`
  )
}

render(DualCounter, document.getElementById('root'))
