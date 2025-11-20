'use client';
import React, { Component } from "react";

import { Crisp } from "crisp-sdk-web";

class CrispChat extends Component {
  componentDidMount () {
    Crisp.configure("90b8a5ff-f2ac-48b2-b1a0-5b268992199f");
  }

  render () {
    return null;
  }
}
export default CrispChat;