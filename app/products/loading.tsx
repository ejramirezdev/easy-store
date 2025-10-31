import { Container, Skeleton, Grid } from "@mui/material";

export default function Loading() {
  return (
    <Container sx={{ py: 4 }}>
      <Skeleton variant="text" width={220} height={48} />
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Skeleton variant="rectangular" height={180} sx={{ mb: 1 }} />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="60%" />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
