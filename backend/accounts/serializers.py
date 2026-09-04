# pyrefly: ignore [missing-import]
from django.contrib.auth.models import User
# pyrefly: ignore [missing-import]
from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
        ]
        extra_kwargs = {
            "username": {
                "validators": [],
            },
            "email": {
                "validators": [],
            },
        }

    def validate(self, attrs):
        username = attrs.get("username", "").strip()
        email = attrs.get("email", "").strip().lower()
        password = attrs.get("password")

        if not username:
            raise serializers.ValidationError({"username": ["Username is required."]})
        if not email:
            raise serializers.ValidationError({"email": ["Email is required."]})
        if not password or len(password) < 8:
            raise serializers.ValidationError({"password": ["Password must be at least 8 characters."]})

        # Reject if an active user already has this username
        if User.objects.filter(username=username, is_active=True).exists():
            raise serializers.ValidationError({"username": ["This username is already taken. Please choose another."]})

        # Reject if an active user already has this email
        if User.objects.filter(email=email, is_active=True).exists():
            raise serializers.ValidationError({"email": ["An account with this email already exists. Please log in."]})

        attrs["username"] = username
        attrs["email"] = email
        return attrs

    def create(self, validated_data):
        username = validated_data["username"]
        email = validated_data["email"]
        password = validated_data["password"]

        # Check if an unverified account exists with the username or email
        unverified_user = User.objects.filter(username=username, is_active=False).first()
        if not unverified_user:
            unverified_user = User.objects.filter(email=email, is_active=False).first()

        if unverified_user:
            unverified_user.username = username
            unverified_user.email = email
            unverified_user.set_password(password)
            unverified_user.save()
            return unverified_user

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
        )
        user.is_active = False
        user.save(update_fields=["is_active"])
        return user