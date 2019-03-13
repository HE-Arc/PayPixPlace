from django import forms
from django.contrib.auth.forms import UserCreationForm
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Row, Column
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
            StrictButton('Register', type='submit', css_class='btn-outline-info mb-3'),
        )

class UpdateForm(forms.ModelForm):
    email = forms.EmailField()

    class Meta:
        model = User
        fields = (
            'username',
            'email',
            'first_name',
            'last_name'
        )

"""
class CreateCanvas(forms.ModelForm):
    CHOICES=[(0,'Public'),
         (1,'Community'),
         (2,'Private')]

    place = forms.ChoiceField(choices=CHOICES, widget=forms.RadioSelect, initial=1)

    class Meta:
        model = Canvas
        fields = ( 'name', 'theme', 'width', 'place', 'is_profit_on' )
        labels = {
            'is_profit_on': 'Enable profit for 250 PIX! - You will get 10% of the PIX that users spent on this canvas, if this is enabled!',
        }

    def __init__(self, *args, **kwargs):
        super(CreateCanvas, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'POST'
        self.helper.form_action = './'
        self.helper.layout = Layout(
            PrependedText('name', '<i class="fas fa-user"></i>'),
            PrependedText('theme', '<i class="fas fa-book"></i>'),
            PrependedText('width', '<i class="fas fa-arrows-alt-h"></i>'),
            'is_profit_on',
            InlineRadios('place', css_class='p-0'),
            StrictButton('Create Canvas', type='submit', css_class='btn-outline-info'),
        )
"""