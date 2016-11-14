import Ember from 'ember'
import config from './config/environment'

const { Router: BaseRouter } = Ember

const Router = BaseRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
})

Router.map(function () {
})

export default Router
