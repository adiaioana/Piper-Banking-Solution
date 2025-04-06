# Stage 1: Build
FROM mcr.microsoft.com/dotnet/nightly/sdk:9.0 AS build

WORKDIR /src

# Copy the .csproj and restore dependencies
COPY ./server-solution/server-solution.csproj ./server-solution/
RUN dotnet restore ./server-solution/server-solution.csproj

# Copy the rest of the files and publish
COPY ./server-solution ./server-solution/
WORKDIR /src/server-solution
RUN dotnet build -c Release -o /app/build
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/nightly/aspnet:9.0 AS final

WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:${PORT}
EXPOSE 8081

ENTRYPOINT ["dotnet", "server-solution.dll"]
