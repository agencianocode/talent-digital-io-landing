const ProfilePage = () => {
  return (
    <div className="p-8">
      {/* Title */}
      <h1 className="text-3xl font-bold text-foreground mb-8">
        Mi Perfil
      </h1>

      {/* Placeholder content */}
      <div className="bg-secondary rounded-lg p-12 min-h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground text-lg">
          Configuración de perfil próximamente...
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;