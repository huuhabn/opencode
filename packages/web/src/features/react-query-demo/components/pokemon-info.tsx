import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { pokemonQueries } from '../api/queries'

const POKEMON_IDS = [25, 1, 4, 7, 6, 150, 133, 39, 143, 94]

function StatBar({ value }: { value: number }) {
  return (
    <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
      <div
        className='h-full bg-primary'
        style={{ width: `${Math.min(value, 150) / 1.5}%` }}
      />
    </div>
  )
}

export function PokemonInfo() {
  const [pokemonId, setPokemonId] = useState(25)
  const { data } = useSuspenseQuery(pokemonQueries.detail(pokemonId))

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Pick a Pokemon</CardTitle>
          <CardDescription>
            Each selection uses <code>useSuspenseQuery</code>. Cached results
            are instant. A new id shows the suspense fallback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-2'>
            {POKEMON_IDS.map((id) => (
              <Button
                key={id}
                type='button'
                variant={pokemonId === id ? 'default' : 'outline'}
                size='sm'
                onClick={() => setPokemonId(id)}
              >
                #{id}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <CardTitle className='capitalize'>{data.name}</CardTitle>
            <div className='flex gap-1'>
              {data.types.map(({ type }) => (
                <Badge key={type.name} variant='secondary'>
                  {type.name}
                </Badge>
              ))}
            </div>
          </div>
          <CardDescription>
            Height: {data.height / 10}m · Weight: {data.weight / 10}kg
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center gap-6 sm:flex-row'>
            <img
              src={data.sprites.front_shiny}
              alt={data.name}
              width={160}
              height={160}
              className='rounded-lg bg-muted/50'
            />
            <div className='flex-1 space-y-3'>
              {data.stats.map((stat) => (
                <div key={stat.stat.name} className='space-y-1'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground capitalize'>
                      {stat.stat.name}
                    </span>
                    <span className='font-medium'>{stat.base_stat}</span>
                  </div>
                  <StatBar value={stat.base_stat} />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className='text-xs text-muted-foreground'>
            Data from PokeAPI. Prefetched in the route loader with the same{' '}
            <code>pokemonQueries.detail()</code> object the component reads.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
