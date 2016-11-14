import { run } from 'ember'

export default function destroyApp (application) {
  run(application, 'destroy')
}
