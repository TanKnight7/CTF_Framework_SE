from rest_framework import serializers
from rest_framework.response import Response
from .models import Category, Challenges
from .serializers import  ChallengeSerializer, CategorySerializer, CategoryDetailSerializer, CreateChallengeSerializer

# =================================================
# CRUD Category
# =================================================

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_categories(request):
    try:
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
    except Category.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_category(request):
    serializer = CategorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"success" : "Successfully created category"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def edit_categories(request, category_name):
    try:
        # haven't added authentication if user is admin
        category = Category.objects.get(name=category_name)
        serializer = CategorySerializer(category, data=request.data)
        if not serializer.is_valid():
            return Response({"error" : serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response({"success": "Category succesfully updated!", "category_data" : serializer.data})
    except Category.DoesNotExist:
        return Response({"error": "Category not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_categories(request, category_name):
    try:
        # haven't added authentication if user is admin
        category = Category.objects.get(name=category_name)
        category.delete()
        return Response({"success": "Category deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    except Category.DoesNotExist:
        return Response({"error": "Category not found"}, status=status.HTTP_404_NOT_FOUND)

# =================================================
# See Challenges List Based on Category
# =================================================

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_challenges_by_categories(request, category_name):
    try:
        challenges = Challenge.objects.get(category=category_name)
        serializer = CategoryDetailSerializer(challenges, many=True)
        return Response({"challenges" : serializer.data})
    except Challenge.DoesNotExist:
        return Response({'error': 'No challenge in the category'}, status=status.HTTP_404_NOT_FOUND)

# =================================================
# CRUD Challenge (Not Done)
# =================================================

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_challenge_detail(request, challenge_id):
    try:
        challenge = Challenge.objects.get(pk=challenge_id)
        serializer = ChallengeSerializer(challenge, many=True)
        return Response(serailizer.data)
    except Challenge.DoesNotExist:
        return Response({'error': 'Challenge not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create(request):
    data = request.data.copy()
    data['author'] = request.user.id
    data['solve_count'] = 0
    data['attachment'] = '' # need to be updated
    data['rating'] = 0.0
    serializer = CreateChallengeSerializer(data=data)
    if not serailizer.is_valid():
        return Response({"error" : serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"success" : serializers.data}, status=status.HTTP_201_CREATED)
