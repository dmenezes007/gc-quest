# Scalable folder structure

This project uses module-oriented organization:

- `app/(platform)/*`: route entry points by module
- `modules/dashboard|profile|knowledge|missions|badges|admin`: domain modules
- `modules/services`: shared service layer
- `modules/gamification-engine`: point and rule engine
- `modules/permissions`: role and access guard
- `config`: cross-module app configuration
