import React, { Component } from "react";
import { Button } from "reactstrap";
import { UncontrolledTooltip } from "reactstrap";

import "./InstanceBtnPubLink.css";

class InstanceBtnPubLink extends Component {
  render() {
    return (
      <div className={this.props.className}>
        <Button
          color="link"
          className={this.props.classNameBtn + " ezmaster-a-globe"}
          onClick={this.toggleModal}
        >
          <i
            className={"fa fa-globe"}
            id={this.props.instance.technicalName + "-publink"}
          />
        </Button>

        <UncontrolledTooltip
          placement="top"
          target={this.props.instance.technicalName + "-publink"}
        >
          Open the <code>{this.props.instance.technicalName}</code> public URL
        </UncontrolledTooltip>
      </div>
    );
  }
}

export default InstanceBtnPubLink;
