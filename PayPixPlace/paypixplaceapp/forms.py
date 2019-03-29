from django import forms
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Div
from crispy_forms.bootstrap import InlineRadios, PrependedText, StrictButton
from .models import Canvas

class CreateCanvas(forms.ModelForm):
    CHOICES=[(0,'Official'),
         (1,'Community')]

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
        self.helper.layout = Layout(
            PrependedText('name', '<i class="fas fa-user"></i>'),
            PrependedText('theme', '<i class="fas fa-book"></i>'),
            PrependedText('width', '<i class="fas fa-arrows-alt-h"></i>'),
            'is_profit_on',
            InlineRadios('place', css_class='p-0', id="place"),
            Div(css_class="ppp-hr-gray mb-3"),
            Div(StrictButton('Create Canvas', type='submit', css_class='btn btn-dark ppp-btn-lg'), css_class="text-right"),
        )
