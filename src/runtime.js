import htm from 'htm'
import { classModule, eventListenersModule, h, init, propsModule, styleModule } from 'snabbdom'

function createElement(type, props, ...children) {
  if (typeof type == 'function') {
    return type(props)
  }
  const on = Object.create({})
  for (const prop in props) {
    if (prop.startsWith('on') && prop !== 'on') {
      const eventName = prop.slice(2).toLowerCase()
      on[eventName] = props[prop]
      delete props[prop]
    }
  }
  return h(type, { props, on }, children)
}

const patch = init([
  classModule,
  propsModule,
  styleModule,
  eventListenersModule,
])

const Runtime = (function() {
  let _rootComponent
  let _currentVNode
  let _hooks = []
  let _currentHookIndex = 0
  let _effectQueue = []
  return {
    render(Component, root) {
      const vnode = typeof Component !== 'function' ? Component : Component()
      _currentHookIndex = 0
      _currentVNode = patch(root, vnode)
      _rootComponent = Component
      while (_effectQueue.length) {
        _effectQueue.pop()()
      }
    },
    useEffect(callback, depArray) {
      const hasNoDeps = !depArray
      const deps = _hooks[_currentHookIndex]
      const hasChangedDeps = deps ? !depArray.every((el, i) => el === deps[i]) : true
      if (hasNoDeps || hasChangedDeps) {
        _effectQueue.push(callback)
        _hooks[_currentHookIndex] = depArray
      }
      _currentHookIndex++;
    },
    useState(initialValue) {
      _hooks[_currentHookIndex] = _hooks[_currentHookIndex] || initialValue
      const setStateHookIndex = _currentHookIndex
      const setState = newState => {
        if (typeof newState === 'function') {
          newState = newState(_hooks[setStateHookIndex])
        }
        _hooks[setStateHookIndex] = newState
        render(_rootComponent, _currentVNode)
      }
      return [_hooks[_currentHookIndex++], setState]
    },
    useCallback(callback, depArray) {
      const hasNoDeps = !depArray
      const deps = _hooks[_currentHookIndex]
      const hasChangedDeps = deps ? !depArray.every((el, i) => el === deps[i]) : true
      if (hasNoDeps || hasChangedDeps) {
        _hooks[_currentHookIndex] = callback
      }
      return _hooks[_currentHookIndex++]
    },
  }
})()

export const render = Runtime.render
export const useEffect = Runtime.useEffect
export const useState = Runtime.useState
export const useCallback = Runtime.useCallback

export const html = htm.bind(createElement)
