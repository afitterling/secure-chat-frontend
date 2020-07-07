import React from 'react'
import { Button, Modal } from 'semantic-ui-react'

const ModalModalExample = () => (
  <Modal trigger={<Button><i className="icon settings"/></Button>}>
    <Modal.Header><span><i className="icon settings"></i></span>Settings</Modal.Header>
    <Modal.Content>
      <Modal.Description>
      </Modal.Description>
    </Modal.Content>
  </Modal>
)

export default ModalModalExample
