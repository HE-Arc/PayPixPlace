from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Row, Column, Div, HTML
from crispy_forms.bootstrap import PrependedText, StrictButton
from paypixplaceapp.models import User

class RegisterForm(UserCreationForm):
    email = forms.EmailField()

    class Meta:
        model = User
        fields = ( 'username', 'first_name', 'last_name', 'email', 'password1', 'password2' )

    def __init__(self, *args, **kwargs):
        super(RegisterForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'POST'
        self.helper.layout = Layout(
            PrependedText('username', '<i class="fas fa-user"></i>'),
            Row(
                Column(
                    PrependedText('first_name', '<i class="fas fa-user-tag"></i>'),
                    css_class='col-md-6'
                ),
                Column(
                    PrependedText('last_name', '<i class="fas fa-user-tag"></i>'),
                    css_class='col-md-6'
                ),
                css_class='row'
            ),
            PrependedText('email', '<i class="fas fa-at"></i>'),
            PrependedText('password1', '<i class="fas fa-key"></i>'),
            PrependedText('password2', '<i class="fas fa-lock"></i>'),
            Div(css_class="ppp-hr-gray mb-3"),
            Div(StrictButton('Register', type='submit', css_class='btn btn-dark ppp-btn-lg'), css_class="text-right"),
        )

class UpdateForm(forms.ModelForm):
    email = forms.EmailField()

    class Meta:
        model = User
        fields = ( 'username', 'email', 'first_name', 'last_name' )

    def __init__(self, *args, **kwargs):
        super(UpdateForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'POST'
        self.helper.layout = Layout(
            PrependedText('username', '<i class="fas fa-user"></i>'),
            Row(
                Column(
                    PrependedText('first_name', '<i class="fas fa-user-tag"></i>'),
                    css_class='col-md-6'
                ),
                Column(
                    PrependedText('last_name', '<i class="fas fa-user-tag"></i>'),
                    css_class='col-md-6'
                ),
                css_class='row'
            ),
            PrependedText('email', '<i class="fas fa-at"></i>'),
            Div(css_class="ppp-hr-gray mb-3"),
            Div(StrictButton('Update', type='submit', css_class='btn btn-dark ppp-btn-lg'), css_class="text-right"),
        )

class LoginForm(AuthenticationForm):

    class Meta:
        model = User
        fields = ( 'username', 'password' )

    def __init__(self, *args, **kwargs):
        super(LoginForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'POST'
        self.helper.layout = Layout(
            PrependedText('username', '<i class="fas fa-user"></i>'),
            PrependedText('password', '<i class="fas fa-key"></i>'),
            Div(css_class="ppp-hr-gray mb-3"),
            Div(StrictButton('Login', type='submit', css_class='btn btn-dark ppp-btn-lg'), css_class="text-right"),
        )