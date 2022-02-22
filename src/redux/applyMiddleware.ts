import compose from './compose'
import { Middleware, MiddlewareAPI } from './types/middleware'
import { AnyAction } from './types/actions'
import { StoreEnhancer, Dispatch, PreloadedState, StoreEnhancerStoreCreator } from './types/store'
import { Reducer } from './types/reducers'
export default function applyMiddleware(middlewares: Middleware[]): StoreEnhancer {
  return (createStore: StoreEnhancerStoreCreator) => <S, A extends AnyAction>(reducer: Reducer<S, A>, preloadedState?: PreloadedState<S>) => {
    const store = createStore(reducer, preloadedState)
    let dispatch: Dispatch = () => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
        'Other middleware would not be applied to this dispatch.'
      )
    }

    const middlewareAPI: MiddlewareAPI = {
      getState: store.getState,
      dispatch: (action, ...args) => dispatch(action, ...args)
    }

    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = compose<typeof dispatch>(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
