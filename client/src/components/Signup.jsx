import React, { Component } from 'react';
import { gql } from 'apollo-boost';
import { Mutation } from 'react-apollo';
import { Redirect } from 'react-router-dom';
import { Form, Icon, Input, Button, Card, Alert, Tooltip } from 'antd';

import { AUTH_TOKEN } from '../constants';
import { serverMessage } from '../utils';

const FormItem = Form.Item;

const SIGNUP_MUTATION = gql`
  mutation SignupMutation(
    $email: String!
    $password: String!
    $user_name: String!
  ) {
    signup(email: $email, password: $password, user_name: $user_name) {
      token
      user {
        id
      }
    }
  }
`;

class Signup extends Component {
  state = {
    email: '',
    userName: '',
    password: '',
    confirmDirty: false,
    serverValidationMessage: ''
  };

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback(`The entered passwords don't match!`);
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  };

  handleConfirmBlur = e => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  _confirm = async data => {
    const {
      token,
      user: { id }
    } = data.signup;

    this._saveUserData(token, id);
    this.props.history.push(`/`);
  };

  _saveUserData = (token, id) => {
    localStorage.setItem(AUTH_TOKEN, token);
    localStorage.setItem('USER_ID', id);
  };

  handleSubmit(e, mutation, validateFields) {
    e.preventDefault();
    validateFields(err => {
      if (!err) {
        mutation();
      }
    });
  }

  render() {
    const { email, password, userName, validationMessage } = this.state;
    const { getFieldDecorator, validateFields } = this.props.form;

    if (localStorage.getItem(AUTH_TOKEN)) {
      return <Redirect to="/" />;
    }

    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
        <Card style={{ width: '400px' }}>
          <Mutation
            mutation={SIGNUP_MUTATION}
            variables={{ email, password, user_name: userName }}
            onCompleted={data => this._confirm(data)}
            onError={({ message }) =>
              this.setState({ validationMessage: serverMessage(message) })
            }
          >
            {mutation => (
              <Form
                onSubmit={e => this.handleSubmit(e, mutation, validateFields)}
              >
                <FormItem>
                  {validationMessage && (
                    <Alert type="error" message={validationMessage} />
                  )}
                </FormItem>
                <FormItem label="Email">
                  {getFieldDecorator('email', {
                    rules: [
                      { required: true, message: 'Please input your email!' }
                    ]
                  })(
                    <Input
                      onChange={e =>
                        this.setState({
                          email: e.target.value
                        })
                      }
                    />
                  )}
                </FormItem>
                <FormItem label="Password">
                  {getFieldDecorator('password', {
                    rules: [
                      {
                        required: true,
                        message: 'Please input your Password!'
                      },
                      {
                        validator: this.validateToNextPassword
                      }
                    ]
                  })(<Input type="password" />)}
                </FormItem>
                <FormItem label="Confirm Password">
                  {getFieldDecorator('confirm', {
                    rules: [
                      {
                        required: true,
                        message: 'Please confirm your password!'
                      },
                      {
                        validator: this.compareToFirstPassword
                      }
                    ]
                  })(
                    <Input
                      type="password"
                      onBlur={this.handleConfirmBlur}
                      onChange={e =>
                        this.setState({
                          password: e.target.value
                        })
                      }
                    />
                  )}
                </FormItem>
                <FormItem
                  label={
                    <span>
                      Username&nbsp;
                      <Tooltip title="What do you want others to call you?">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  }
                >
                  {getFieldDecorator('userName', {
                    rules: [
                      {
                        required: true,
                        message: 'Please input your nickname!',
                        whitespace: true
                      }
                    ]
                  })(
                    <Input
                      onChange={e =>
                        this.setState({ userName: e.target.value })
                      }
                    />
                  )}
                </FormItem>
                <FormItem>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ width: '100%' }}
                  >
                    Sign up
                  </Button>
                </FormItem>
              </Form>
            )}
          </Mutation>
        </Card>
      </div>
    );
  }
}

export default Form.create()(Signup);
