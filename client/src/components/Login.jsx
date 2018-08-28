import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { gql } from 'apollo-boost';
import { Mutation } from 'react-apollo';
import { Form, Icon, Input, Button, Checkbox, Card, Alert } from 'antd';

import { AUTH_TOKEN } from '../constants';
import { serverMessage } from '../utils';

const FormItem = Form.Item;

const LOGIN_MUTATION = gql`
  mutation LoginMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
      }
    }
  }
`;

class Login extends Component {
  state = {
    email: '',
    password: '',
    serverValidationMessage: ''
  };

  _confirm = async data => {
    const {
      token,
      user: { id }
    } = data.login;

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
    const { email, password, validationMessage } = this.state;
    const { getFieldDecorator, validateFields } = this.props.form;

    if (localStorage.getItem(AUTH_TOKEN)) {
      return <Redirect to="/" />;
    }

    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
        <Card style={{ maxWidth: '300px' }}>
          <Mutation
            mutation={LOGIN_MUTATION}
            variables={{ email, password }}
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
                <FormItem>
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
                      prefix={
                        <Icon
                          type="user"
                          style={{ color: 'rgba(0,0,0,.25)' }}
                        />
                      }
                      placeholder="Email"
                    />
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('password', {
                    rules: [
                      { required: true, message: 'Please input your Password!' }
                    ]
                  })(
                    <Input
                      onChange={e =>
                        this.setState({
                          password: e.target.value
                        })
                      }
                      prefix={
                        <Icon
                          type="lock"
                          style={{ color: 'rgba(0,0,0,.25)' }}
                        />
                      }
                      type="password"
                      placeholder="Password"
                    />
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('remember', {
                    valuePropName: 'checked',
                    initialValue: true
                  })(<Checkbox>Remember me</Checkbox>)}
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ width: '100%' }}
                  >
                    Log in
                  </Button>
                  Or <Link to="/signup">Sign up!</Link>
                </FormItem>
              </Form>
            )}
          </Mutation>
        </Card>
      </div>
    );
  }
}

export default Form.create()(Login);
