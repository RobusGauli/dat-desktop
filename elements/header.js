'use strict'

const version = require('../package.json').version
const microcomponent = require('microcomponent')
const gravatar = require('gravatar')
const html = require('choo/html')
const assert = require('assert')
const css = require('sheetify')

const button = require('./button')
const DatImport = require('./dat-import')
const icon = require('./icon')

module.exports = HeaderElement

const header = css`
  :host {
    height: 2.5rem;
    padding: .25rem .75rem;
    background-color: var(--color-neutral);
    color: var(--color-white);
    -webkit-app-region: drag;
  }
`

const shareButtonIcon = css`
  :host {
    width: 1.2em;
  }
`

const menuButtonIcon = css`
  :host {
    width: 1em;
  }
`

function HeaderElement () {
  var importButton = DatImport()
  var component = microcomponent({ name: 'header' })
  component.on('render', render)
  component.on('update', update)
  return component

  function render () {
    var { isReady, session, onimport, oncreate, onreport, onlogin, onlogout, onprofile, onhomepage } = this.props
    var { showMenu, willShowMenu } = this.state

    if (typeof willShowMenu === 'boolean') {
      showMenu = this.state.showMenu = willShowMenu
      this.state.willShowMenu = null
    }

    assert.equal(typeof isReady, 'boolean', 'elements/header: isReady should be type boolean')
    assert.equal(typeof onimport, 'function', 'elements/header: onimport should be type function')
    assert.equal(typeof oncreate, 'function', 'elements/header: oncreate should be type function')

    if (!isReady) {
      return html`<header class="${header}"></header>`
    }

    var createButton = button.header('Share Folder', {
      id: 'create-new-dat',
      icon: icon('create-new-dat', { class: shareButtonIcon }),
      class: 'ml2 ml3-l b--transparent v-mid color-neutral-30 hover-color-white f7 f6-l',
      onclick: oncreate
    })

    var loginButton = button.header('Log In', {
      class: 'ml3 v-mid color-neutral-30 hover-color-white f7 f6-l',
      onclick: onlogin
    })

    var menuButton = button.icon('Open Menu', {
      icon: icon('info', { class: menuButtonIcon }),
      class: 'ml3 v-mid color-neutral-20 hover-color-white pointer',
      onclick: toggle
    })

    var avatar = {
      size: 23
    }
    if (session) {
      avatar.url = gravatar.url(session.email, {
        s: avatar.size * 2,
        r: 'pg',
        d: '404',
        protocol: 'https'
      })
    }

    function toggle () {
      if (component.state.showMenu) hide()
      else show()
    }

    function show () {
      document.body.addEventListener('click', clickedOutside)
      component.state.willShowMenu = true
      component.render(component.props)
    }

    function hide () {
      document.body.removeEventListener('click', clickedOutside)
      component.state.willShowMenu = false
      component.render(component.props)
    }

    function clickedOutside (e) {
      if (!component._element.contains(e.target)) hide()
    }

    function onclicklogout () {
      component.state.willShowMenu = false
      onlogout()
    }

    return html`
      <header class="${header}">
        <div class="fr relative">
          ${importButton.render({
            onsubmit: onimport
          })}
          ${createButton}
          ${session
            ? html`
                <img onclick=${toggle} src=${avatar.url} width=${avatar.size} height=${avatar.size} />
              `
            : html`
                <span>
                  ${menuButton}
                  ${loginButton}
                </span>
              `}
          ${showMenu
            ? html`
            <div class="absolute right-0 w5 pa3 bg-neutral">
              ${session
                ? html`
                    <p class="f6 f5-l mb3">
                      ${session.email}
                    </p>
                  `
                : html`
                    <p class="f6 f5-l mb3">
                      Dat Desktop is a peer to peer sharing app built for humans by humans.
                    </p>
                  `}
              ${session
                ? html`
                    <p class="f6 f5-l">
                      <a onclick=${onprofile} href="#" class="color-neutral-50 hover-color-neutral-70">Profile</a>
                    </p>
                  `
                : ''}
              <p class="f6 f5-l">
                <a onclick=${onreport} href="#" class="color-neutral-50  hover-color-neutral-70">Report Bug</a>
              </p>
              ${session
                ? html`
                    <p class="f6 f5-l">
                      <a onclick=${onclicklogout} href="#" class="color-neutral-50 hover-color-neutral-70">Log out</a>
                    </p>
                  `
                : ''}
              <h3 class="f6 f5-l mb2">
                Version ${version} | Built by
                <a onclick=${onhomepage} href="#" class="color-neutral-50 hover-color-neutral-70">datproject.org</a>
              </h3>
            </div>
              `
            : ''}
        </div>
      </header>
    `
  }

  function update (props) {
    return props.isReady !== this.props.isReady ||
      typeof this.state.willShowMenu === 'boolean' ||
      props.session !== this.props.session
  }
}
