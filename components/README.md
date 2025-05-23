# Katkot Component Library

This component library follows the Atomic Design methodology to create a consistent and maintainable UI system.

## Atomic Design Structure

### Atoms
Basic building blocks of the interface:
- Button
- Avatar
- Input
- Typography elements
- Icons

### Molecules
Simple combinations of atoms:
- UserCard
- FormField (input + label)
- SearchBar
- NotificationItem

### Organisms
Complex UI components:
- ProfileHeader
- PostCard
- Navigation
- FollowersModal

### Templates
Page-level layouts:
- ProfileTemplate
- FeedTemplate
- AuthTemplate

## Usage Guidelines

1. Always use the most basic component possible
2. Compose complex components from simpler ones
3. Keep components focused on a single responsibility
4. Document props and usage examples

## Adding New Components

When adding new components:
1. Identify which level of atomic design it belongs to
2. Create the component in the appropriate folder
3. Use existing atoms/molecules when possible
4. Add TypeScript interfaces for props
5. Update this documentation if needed