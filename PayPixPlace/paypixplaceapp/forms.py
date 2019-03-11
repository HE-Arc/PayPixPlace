from django import forms
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Row, Column
from crispy_forms.bootstrap import InlineRadios, PrependedText, StrictButton
from .models import Canvas

class CreateCanvas(forms.ModelForm):
    CHOICES=[('0','Public'),
         ('1','Community'),
         ('2','Private')]

    place = forms.ChoiceField(choices=CHOICES, widget=forms.RadioSelect, initial='1')

    class Meta:
        model = Canvas
        fields = ( 'name', 'theme', 'width', 'height', 'place' )

    def __init__(self, *args, **kwargs):
        super(CreateCanvas, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        
        self.helper.layout = Layout(
            PrependedText('name', '<i class="fas fa-user"></i>'),
            PrependedText('theme', '<i class="fas fa-book"></i>'),
            Row(
                Column(
                    PrependedText('width', '<i class="fas fa-arrows-alt-h"></i>'),
                    css_class='form-group col-md-6 mb-0'
                ),
                Column(
                    PrependedText('height', '<i class="fas fa-arrows-alt-v"></i>'),
                    css_class='form-group col-md-6 mb-0'
                ),
                css_class='form-row'
            ),
            InlineRadios('place', css_class='p-0'),
            StrictButton('Create Canvas', type='submit', css_class='btn-outline-info'),
        )
