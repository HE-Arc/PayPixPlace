from django import forms

class CreateCanvas(forms.Form):
    canvas_name = forms.CharField(label='Canvas Name', max_length=50)