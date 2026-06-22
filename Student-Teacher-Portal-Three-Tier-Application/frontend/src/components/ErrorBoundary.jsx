// ErrorBoundary.jsx
import React from "react";
export default class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError:false, error:null}; }
  static getDerivedStateFromError(error){ return { hasError: true, error }; }
  componentDidCatch(error, info){ console.error('ErrorBoundary caught', error, info); }
  render(){
    if(this.state.hasError){
      return <div role="alert" style={{padding:16}}>Something went wrong. Please refresh.</div>;
    }
    return this.props.children;
  }
}
