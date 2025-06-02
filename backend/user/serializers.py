from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User
from challenge.models import ChallengeSolve
from django.db.models import Sum
from django.db import IntegrityError

class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'email']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this name already exists.")
        return value.lower()
    
    def validate_password(self, value):
        validate_password(value, user=self.instance)
        return value

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserListSerializer(serializers.ModelSerializer):
    total_point = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'username', 'total_point']
        
    def get_total_point(self, instance):
        return (
            ChallengeSolve.objects
            .filter(user=instance)
            .aggregate(total=Sum('challenge__point'))['total'] or 0
        )

class UserDetailSerializer(serializers.ModelSerializer):
    from team.serializers import TeamListSerializer
    total_point = serializers.SerializerMethodField()
    team = TeamListSerializer()
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'bio', 'country', 'team', 'total_point']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request', None)
        
        if request:
            user = request.user
            if user != instance and not user.role != 'admin':
                # Hide email if viewer is NOT owner or staff
                data.pop('email', None)
        else:
            # No request context, be safe and remove email
            data.pop('email', None)

        return data
    
    def get_total_point(self, instance):
        return (
            ChallengeSolve.objects
            .filter(user=instance)
            .aggregate(total=Sum('challenge__point'))['total'] or 0
        )

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'bio', 'country', 'username', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'email': {'required': False},
            'bio': {'required': False},
            'country': {'required': False},
            'username': {'required': False},
        }
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        # Update other fields normally
        try:
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.full_clean()  # Run model validation (e.g., unique constraints)
        except IntegrityError as e:
            # Handle database integrity errors (like duplicate fields)
            raise serializers.ValidationError({"error": "Duplicate value error, email or username might already be taken."})
        except Exception as e:
            # Other validation errors
            raise serializers.ValidationError({"error": str(e)})

        # Update password if provided
        if password:
            try:
                instance.set_password(password)
            except Exception as e:
                raise serializers.ValidationError({"error": f"Error setting password: {str(e)}"})

        instance.save()
        return instance
