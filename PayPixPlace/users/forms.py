from django import forms

from paypixplaceapp.models import User

class UserForm(forms.ModelForm):

    class Meta:
        model = User
        fields = ('username', 'email', 'password')